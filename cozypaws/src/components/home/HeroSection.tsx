'use client';

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="relative z-10">
            <div className="inline-block mb-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-semibold text-blue-700">
                <span>✨</span> New Arrivals Every Week
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight">
              <span className="block text-gray-900">Everything</span>
              <span className="block text-gray-900">Your Pet</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                Needs & Loves
              </span>
            </h1>

            <p className="mt-6 text-xl text-gray-600 leading-relaxed max-w-xl">
              2,000+ premium brands. Unbeatable prices. Delivered with love to your doorstep in 1-3 days.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href="#products"
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Shop Now
                <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>

              <a
                href="#deals"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-blue-600 px-8 py-4 text-lg font-bold text-blue-600 hover:bg-blue-50 transition"
              >
                <span>🔥</span>
                Today's Deals
              </a>
            </div>

            {/* Trust Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  500K+
                </div>
                <div className="mt-1 text-sm text-gray-600">Happy Pets</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="mt-1 text-sm text-gray-600">Support</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                  4.9★
                </div>
                <div className="mt-1 text-sm text-gray-600">Rated</div>
              </div>
            </div>
          </div>

          {/* Right Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform">
                  <img
                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop"
                    alt="Happy dog"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform">
                  <img
                    src="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=450&fit=crop"
                    alt="Cat"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform">
                  <img
                    src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&h=450&fit=crop"
                    alt="Pets playing"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-transform">
                  <img
                    src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=600&fit=crop"
                    alt="Puppy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 ring-2 ring-white" />
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 ring-2 ring-white" />
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-red-400 ring-2 ring-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">500K+ Customers</div>
                  <div className="text-xs text-gray-500">Love CozyPaws</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
