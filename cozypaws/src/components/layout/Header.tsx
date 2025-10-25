'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium">
            🎉 Free Shipping on Orders $49+ • Same-Day Delivery Available in Select Areas
          </p>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="text-3xl">🐾</div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CozyPaws
              </span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands, or categories..."
                  className="w-full rounded-full border-2 border-gray-300 py-2.5 pl-5 pr-12 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button className="absolute right-1 top-1 bottom-1 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700 transition">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link href="/account" className="hidden md:flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium">Account</span>
              </Link>

              <Link href="/cart" className="relative flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {itemCount}
                  </span>
                )}
                <span className="hidden md:inline text-sm font-medium">Cart</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center gap-8 py-3">
            <NavLink href="/dogs" icon="🐕">Dogs</NavLink>
            <NavLink href="/cats" icon="🐈">Cats</NavLink>
            <NavLink href="/fish" icon="🐟">Fish</NavLink>
            <NavLink href="/birds" icon="🐦">Birds</NavLink>
            <NavLink href="/small-pets" icon="🐹">Small Pets</NavLink>
            <NavLink href="/deals" icon="🔥" highlight>Deals</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, icon, children, highlight }: { href: string; icon: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 text-sm font-semibold transition ${
        highlight
          ? 'text-red-600 hover:text-red-700'
          : 'text-gray-700 hover:text-blue-600'
      }`}
    >
      <span className="text-lg">{icon}</span>
      {children}
    </Link>
  );
}
