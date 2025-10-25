import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: orders } = await supabase
      .from('orders')
      .select('id, email, total_cents, status, supplier_order_id, tracking_number, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!orders) {
      return NextResponse.json([]);
    }

    const ordersWithTracking = await Promise.all(
      orders.map(async (order) => {
        if (order.supplier_order_id) {
          try {
            const cjResponse = await fetch(
              `https://developers.cjdropshipping.com/api2.0/v1/shopping/order/getOrderDetail?orderId=${order.supplier_order_id}`,
              {
                headers: {
                  'CJ-Access-Token': process.env.CJ_ACCESS_TOKEN!,
                },
              }
            );

            if (cjResponse.ok) {
              const cjData = await cjResponse.json();
              if (cjData.code === 200 && cjData.data) {
                return {
                  ...order,
                  cj_tracking_status: cjData.data.orderStatus || 'unknown',
                };
              }
            }
          } catch (error) {
            console.error(`Failed to fetch CJ tracking for order ${order.id}:`, error);
          }
        }

        return order;
      })
    );

    return NextResponse.json(ordersWithTracking);
  } catch (error) {
    console.error('Orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
