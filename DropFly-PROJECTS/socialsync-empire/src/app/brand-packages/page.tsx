'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BrandPackage {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  logo_url: string;
  primary_color: string;
  is_default: boolean;
  created_at: string;
  brand_assets: any[];
}

export default function BrandPackagesPage() {
  const [brandPackages, setBrandPackages] = useState<BrandPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrandPackages();
  }, []);

  async function fetchBrandPackages() {
    try {
      const res = await fetch('/api/brand-packages');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setBrandPackages(data.brandPackages || []);
    } catch (error) {
      console.error('Error fetching brand packages:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Brand Packages
            </h1>
            <p className="text-gray-600">
              Manage your brand identities, logos, and content guidelines
            </p>
          </div>
          <Link
            href="/brand-packages/create"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            + Create Brand Package
          </Link>
        </div>

        {/* Empty State */}
        {brandPackages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No brand packages yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first brand package to personalize your AI-generated content with your logos, colors, and brand guidelines
            </p>
            <Link
              href="/brand-packages/create"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Create Your First Brand Package
            </Link>
          </div>
        ) : (
          /* Brand Packages Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandPackages.map(brandPackage => (
              <Link
                key={brandPackage.id}
                href={`/brand-packages/${brandPackage.id}/edit`}
                className="block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6"
              >
                {/* Default Badge */}
                {brandPackage.is_default && (
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      Default Brand
                    </span>
                  </div>
                )}

                {/* Logo */}
                <div className="mb-4 h-24 flex items-center justify-center bg-gray-50 rounded-lg">
                  {brandPackage.logo_url ? (
                    <img
                      src={brandPackage.logo_url}
                      alt={brandPackage.name}
                      className="max-h-20 max-w-full object-contain"
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: brandPackage.primary_color || '#9333ea' }}
                    >
                      {brandPackage.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Brand Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {brandPackage.name}
                </h3>
                {brandPackage.tagline && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {brandPackage.tagline}
                  </p>
                )}

                {/* Industry */}
                {brandPackage.industry && (
                  <div className="mb-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {brandPackage.industry}
                    </span>
                  </div>
                )}

                {/* Colors */}
                {brandPackage.primary_color && (
                  <div className="flex gap-2 mb-4">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: brandPackage.primary_color }}
                      title="Primary Color"
                    ></div>
                  </div>
                )}

                {/* Asset Count */}
                <div className="border-t pt-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Assets:</span>
                    <span className="font-medium">
                      {brandPackage.brand_assets?.length || 0} uploaded
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
