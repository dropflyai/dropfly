import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '8');

  const mockProducts = Array.from({ length: limit }, (_, i) => ({
    id: `prod-${page}-${i}`,
    sku: `DOG-TOY-${String(i + 1).padStart(3, '0')}`,
    name: `Premium ${['Rope', 'Ball', 'Squeaky', 'Plush', 'Chew'][i % 5]} Dog Toy`,
    priceCents: Math.floor(Math.random() * 2000) + 999,
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
      'https://images.unsplash.com/photo-1535924530232-51d3f11697e9?w=400',
    ],
    rating: 3.5 + Math.random() * 1.5,
    stock: Math.floor(Math.random() * 50) + 10,
    category: 'dog',
  }));

  return NextResponse.json({
    products: mockProducts,
    pagination: {
      page,
      limit,
      total: 24,
      totalPages: Math.ceil(24 / limit),
    },
  });
}
