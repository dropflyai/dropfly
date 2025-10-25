import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CartItemSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number().int().positive(),
  name: z.string(),
  priceCents: z.number().int().positive(),
  sku: z.string(),
  supplier: z.enum(['cj_dropshipping', 'aliexpress']),
  supplierProductId: z.string().optional(),
});

const CartItemsSchema = z.array(CartItemSchema);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const cartItemsRaw = session.metadata?.cartItems;
      if (!cartItemsRaw) {
        return NextResponse.json({ error: 'No cart items in metadata' }, { status: 400 });
      }

      const cartItems = CartItemsSchema.parse(JSON.parse(cartItemsRaw));

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.client_reference_id || null,
          email: session.customer_details?.email!,
          shipping_name: session.customer_details?.name!,
          shipping_address_line1: session.customer_details?.address?.line1!,
          shipping_address_line2: session.customer_details?.address?.line2 || null,
          shipping_city: session.customer_details?.address?.city!,
          shipping_state: session.customer_details?.address?.state!,
          shipping_zip: session.customer_details?.address?.postal_code!,
          shipping_country: session.customer_details?.address?.country || 'US',
          subtotal_cents: session.amount_subtotal!,
          shipping_cents: 0,
          tax_cents: session.total_details?.amount_tax || 0,
          total_cents: session.amount_total!,
          status: 'pending',
          stripe_session_id: session.id,
          stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        })
        .select()
        .single();

      if (orderError || !order) {
        return NextResponse.json({ error: 'Failed to create order' }, { status: 400 });
      }

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        sku: item.sku,
        name: item.name,
        price_cents: item.priceCents,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        return NextResponse.json({ error: 'Failed to create order items' }, { status: 400 });
      }

      const cjItems = cartItems.filter((item) => item.supplier === 'cj_dropshipping');

      if (cjItems.length > 0) {
        const cjOrderPayload = {
          orderNumber: order.id,
          shippingCountryCode: session.customer_details?.address?.country || 'US',
          shippingAddress: {
            name: session.customer_details?.name!,
            addressLine1: session.customer_details?.address?.line1!,
            addressLine2: session.customer_details?.address?.line2 || '',
            city: session.customer_details?.address?.city!,
            state: session.customer_details?.address?.state!,
            zip: session.customer_details?.address?.postal_code!,
            country: session.customer_details?.address?.country || 'US',
            phone: session.customer_details?.phone || '',
          },
          products: cjItems.map((item) => ({
            vid: item.supplierProductId || item.id,
            quantity: item.quantity,
          })),
        };

        const cjResponse = await fetch(
          'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'CJ-Access-Token': process.env.CJ_ACCESS_TOKEN!,
            },
            body: JSON.stringify(cjOrderPayload),
          }
        );

        if (!cjResponse.ok) {
          await supabase
            .from('orders')
            .update({ status: 'processing' })
            .eq('id', order.id);

          return NextResponse.json({ error: 'CJ order creation failed' }, { status: 400 });
        }

        const cjData = await cjResponse.json();

        if (cjData.code === 200 && cjData.data?.orderId) {
          await supabase
            .from('orders')
            .update({
              supplier_order_id: cjData.data.orderId,
              status: 'processing',
            })
            .eq('id', order.id);
        }
      } else {
        await supabase
          .from('orders')
          .update({ status: 'processing' })
          .eq('id', order.id);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}
