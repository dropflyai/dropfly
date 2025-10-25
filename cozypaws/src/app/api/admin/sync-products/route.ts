import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST() {
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

    const cjSynced = await syncCJProducts(supabase);
    const aliexpressSynced = await syncAliExpressProducts(supabase);

    return NextResponse.json({
      success: true,
      synced: {
        cj_dropshipping: cjSynced,
        aliexpress: aliexpressSynced,
      },
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

async function syncCJProducts(supabase: any): Promise<number> {
  try {
    const cjResponse = await fetch(
      'https://developers.cjdropshipping.com/api2.0/v1/product/list?pageNum=1&pageSize=100',
      {
        headers: {
          'CJ-Access-Token': process.env.CJ_ACCESS_TOKEN!,
        },
      }
    );

    if (!cjResponse.ok) return 0;

    const cjData = await cjResponse.json();

    if (cjData.code !== 200 || !cjData.data?.list) return 0;

    const products = cjData.data.list.map((p: any) => ({
      sku: p.productSku,
      name: p.productName || p.productNameEn,
      description: p.description || '',
      category: p.categoryName?.toLowerCase() || 'accessories',
      price_cents: Math.floor((p.sellPrice || 0) * 100),
      cost_cents: Math.floor((p.sellPrice || 0) * 100 * 0.6),
      supplier: 'cj_dropshipping',
      supplier_product_id: p.pid,
      stock: p.listedNum || 0,
      images: p.productImage ? [p.productImage] : [],
    }));

    const { error } = await supabase.from('products').upsert(products, {
      onConflict: 'sku',
    });

    if (error) throw error;

    return products.length;
  } catch (error) {
    console.error('CJ sync error:', error);
    return 0;
  }
}

async function syncAliExpressProducts(supabase: any): Promise<number> {
  try {
    return 0;
  } catch (error) {
    console.error('AliExpress sync error:', error);
    return 0;
  }
}
