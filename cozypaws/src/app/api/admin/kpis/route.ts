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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: orders } = await supabase
      .from('orders')
      .select('total_cents, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const totalRevenueCents = orders?.reduce((sum, order) => sum + order.total_cents, 0) || 0;
    const orderCount = orders?.length || 0;

    const { count: checkoutSessionCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const conversionRate = checkoutSessionCount && checkoutSessionCount > 0
      ? (orderCount / checkoutSessionCount) * 100
      : 0;

    const { data: topSkusData } = await supabase
      .from('order_items')
      .select('sku, name, price_cents, quantity')
      .limit(100);

    const skuMap = new Map<string, { sku: string; name: string; quantity: number; revenueCents: number }>();

    topSkusData?.forEach((item) => {
      const existing = skuMap.get(item.sku);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenueCents += item.price_cents * item.quantity;
      } else {
        skuMap.set(item.sku, {
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          revenueCents: item.price_cents * item.quantity,
        });
      }
    });

    const topSkus = Array.from(skuMap.values())
      .sort((a, b) => b.revenueCents - a.revenueCents)
      .slice(0, 10);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentOrders } = await supabase
      .from('orders')
      .select('total_cents, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    const revenueByDay = new Map<string, number>();

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueByDay.set(dateStr, 0);
    }

    recentOrders?.forEach((order) => {
      const dateStr = new Date(order.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const current = revenueByDay.get(dateStr) || 0;
      revenueByDay.set(dateStr, current + order.total_cents / 100);
    });

    const revenueByDayArray = Array.from(revenueByDay.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    return NextResponse.json({
      totalRevenueCents,
      orderCount,
      conversionRate,
      topSkus,
      revenueByDay: revenueByDayArray,
    });
  } catch (error) {
    console.error('KPIs error:', error);
    return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 });
  }
}
