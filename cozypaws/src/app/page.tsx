import { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { ProductGrid } from '@/components/home/ProductGrid';
import { SearchBar } from '@/components/home/SearchBar';

export const metadata: Metadata = {
  title: 'CozyPaws Outlet - Discount Pet Supplies & Toys',
  description: 'Quality pet supplies at unbeatable prices. Free shipping on orders over $50. Shop dog toys, cat accessories, and more.',
  openGraph: {
    title: 'CozyPaws Outlet - Discount Pet Supplies & Toys',
    description: 'Quality pet supplies at unbeatable prices. Free shipping on orders over $50.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Categories */}
      <div className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Food & Treats', icon: '🍖', color: 'from-orange-400 to-red-400' },
              { name: 'Toys & Play', icon: '🎾', color: 'from-blue-400 to-purple-400' },
              { name: 'Health & Wellness', icon: '💊', color: 'from-green-400 to-teal-400' },
              { name: 'Beds & Furniture', icon: '🛏️', color: 'from-pink-400 to-purple-400' },
            ].map((cat) => (
              <a
                key={cat.name}
                href={`/category/${cat.name.toLowerCase()}`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br p-8 text-center shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
                style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90 group-hover:opacity-100 transition`} />
                <div className="relative z-10">
                  <div className="text-5xl mb-3">{cat.icon}</div>
                  <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid with Infinite Scroll */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Trending Products</h2>
              <p className="mt-2 text-gray-600">Bestsellers loved by pet parents</p>
            </div>
            <a href="/all" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
              View All
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>

          <ProductGrid />
        </div>
      </div>

      {/* Why Shop With Us */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">Why Pet Parents Love Us</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-chewy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">100% Satisfaction Guarantee</h3>
              <p className="mt-2 text-sm text-gray-600">Not happy? We'll make it right</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-chewy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Fast, Free Shipping</h3>
              <p className="mt-2 text-sm text-gray-600">On orders $49+ in 1-3 days</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-chewy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">24/7 Customer Service</h3>
              <p className="mt-2 text-sm text-gray-600">We're here to help anytime</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-chewy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Low Prices</h3>
              <p className="mt-2 text-sm text-gray-600">Competitive prices every day</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
