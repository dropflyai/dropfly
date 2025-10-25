'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';

interface Product {
  id: string;
  sku: string;
  name: string;
  priceCents: number;
  images: string[];
  rating: number;
  stock: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      sku: product.sku,
      name: product.name,
      priceCents: product.priceCents,
      image: product.images[0] || '/placeholder-product.png',
      stock: product.stock,
    });
    onAddToCart(product);
  };

  const formattedPrice = (product.priceCents / 100).toFixed(2);

  return (
    <Link href={`/product/${product.id}`} className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
      {/* Stock Badge */}
      {product.stock < 10 && product.stock > 0 && (
        <div className="absolute top-3 left-3 z-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
          Only {product.stock} left!
        </div>
      )}

      {product.stock === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <span className="rounded-full bg-white px-6 py-3 text-lg font-bold text-gray-900 shadow-xl">
            Out of Stock
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <img
          src={product.images[0] || '/placeholder-product.png'}
          alt={product.name}
          className="h-full w-full object-contain object-center group-hover:scale-110 transition-transform duration-300"
        />

        {/* Quick Add Overlay */}
        {product.stock > 0 && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
            <button
              onClick={handleAddToCart}
              className="w-full rounded-full bg-white px-6 py-3 text-sm font-bold text-gray-900 shadow-xl hover:bg-gray-100 transition transform hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Quick Add
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="ml-1 text-xs font-medium text-gray-600">
            ({product.rating.toFixed(1)})
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px] group-hover:text-blue-600 transition">
          {product.name}
        </h3>

        {/* Price & Stock */}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${formattedPrice}
            </p>
            {product.stock > 0 && (
              <p className="mt-1 text-xs font-semibold text-green-600 flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                In Stock
              </p>
            )}
          </div>

          {/* Add to Cart Icon */}
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-3 text-white shadow-lg hover:shadow-xl transition transform hover:scale-110"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
