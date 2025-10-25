import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ImageCarousel } from '@/components/product/ImageCarousel';
import { StockIndicator } from '@/components/product/StockIndicator';
import { ReviewsList } from '@/components/product/ReviewsList';
import { StickyCheckoutBar } from '@/components/product/StickyCheckoutBar';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  supplier: string;
  stock: number;
  images: string[];
  rating: number;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    verifiedPurchase: boolean;
    createdAt: string;
  }>;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: 'Product Not Found - CozyPaws Outlet',
    };
  }

  return {
    title: `${product.name} - CozyPaws Outlet`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.slice(0, 1),
      type: 'product',
    },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const formattedPrice = (product.priceCents / 100).toFixed(2);

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-gray-500 hover:text-gray-700">Home</a>
            </li>
            <li>
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <a href={`/category/${product.category}`} className="text-gray-500 hover:text-gray-700 capitalize">
                {product.category}
              </a>
            </li>
            <li>
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li className="text-gray-900 font-medium truncate max-w-xs">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image Carousel */}
          <div>
            <ImageCarousel images={product.images} productName={product.name} />
          </div>

          {/* Right Column - Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating.toFixed(1)} ({product.reviews.length} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mt-6">
              <p className="text-4xl font-bold text-gray-900">${formattedPrice}</p>
              <p className="mt-1 text-sm text-gray-500">Free shipping on orders over $50</p>
            </div>

            {/* Stock Indicator */}
            <div className="mt-6">
              <StockIndicator stock={product.stock} />
            </div>

            {/* Description */}
            <div className="mt-6 prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <dl className="space-y-3">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">SKU</dt>
                  <dd className="font-medium text-gray-900">{product.sku}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Category</dt>
                  <dd className="font-medium text-gray-900 capitalize">{product.category}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Supplier</dt>
                  <dd className="font-medium text-gray-900">{product.supplier === 'cj_dropshipping' ? 'CJ Dropshipping' : 'AliExpress'}</dd>
                </div>
              </dl>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-gray-200 pt-6">
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="mt-2 text-xs text-gray-600">Secure Payment</p>
              </div>
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="mt-2 text-xs text-gray-600">Quality Verified</p>
              </div>
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="mt-2 text-xs text-gray-600">Fast Shipping</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <ReviewsList reviews={product.reviews} productId={product.id} />
        </div>
      </div>

      {/* Sticky Checkout Bar */}
      <StickyCheckoutBar product={product} />
    </main>
  );
}
