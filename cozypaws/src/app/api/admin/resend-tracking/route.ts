import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { z } from 'zod';

const ResendSchema = z.object({
  orderId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { orderId } = ResendSchema.parse(body);

    const { data: order } = await supabase
      .from('orders')
      .select('id, email, tracking_number, tracking_url')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.tracking_number) {
      return NextResponse.json({ error: 'No tracking information available' }, { status: 400 });
    }

    console.log(`Sending tracking email to ${order.email} for order ${order.id}`);
    console.log(`Tracking: ${order.tracking_number}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resend tracking error:', error);
    return NextResponse.json({ error: 'Failed to resend tracking' }, { status: 500 });
  }
}
