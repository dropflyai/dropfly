'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateBrandPackagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    mission_statement: '',
    brand_voice: 'professional',
    brand_personality: '',
    target_audience: '',
    key_values: '',
    primary_color: '#9333ea',
    secondary_color: '#3b82f6',
    accent_color: '#10b981',
    logo_url: '',
    website_url: '',
    industry: '',
    description: '',
    is_default: false
  });

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'logo_dark') {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById(`${type}-preview`) as HTMLImageElement;
      if (preview && e.target?.result) {
        preview.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);

    // We'll upload after brand package is created
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Parse key_values from comma-separated string
      const payload = {
        ...formData,
        key_values: formData.key_values
          ? formData.key_values.split(',').map(v => v.trim()).filter(Boolean)
          : []
      };

      const res = await fetch('/api/brand-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create brand package');
        return;
      }

      // Upload logo if provided
      const logoInput = document.getElementById('logo-upload') as HTMLInputElement;
      if (logoInput?.files?.[0]) {
        const logoFormData = new FormData();
        logoFormData.append('file', logoInput.files[0]);
        logoFormData.append('asset_type', 'logo');
        logoFormData.append('title', 'Brand Logo');

        await fetch(`/api/brand-packages/${data.brandPackage.id}/upload`, {
          method: 'POST',
          body: logoFormData
        });
      }

      // Redirect to brand packages list
      router.push('/brand-packages');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/brand-packages" className="text-purple-600 hover:text-purple-700 mb-4 inline-block">
            ← Back to Brand Packages
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Brand Package
          </h1>
          <p className="text-gray-600">
            Set up your brand identity to personalize AI-generated content
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-8">

          {/* Basic Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Acme Corporation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Innovation at its finest"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={e => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Technology, Healthcare, E-commerce"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description of your brand..."
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Brand Logo</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, 'logo')}
                className="hidden"
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
                <div className="mb-4">
                  <img
                    id="logo-preview"
                    src="/placeholder-logo.svg"
                    alt="Logo preview"
                    className="mx-auto h-24 w-24 object-contain hidden"
                  />
                  <div id="logo-placeholder" className="text-4xl mb-2">🎨</div>
                </div>
                <p className="text-gray-600 mb-2">Click to upload your logo</p>
                <p className="text-sm text-gray-500">PNG, JPG, SVG up to 10MB</p>
              </label>
            </div>
            <script dangerouslySetInnerHTML={{__html: `
              document.getElementById('logo-upload')?.addEventListener('change', function(e) {
                const file = e.target.files?.[0];
                if (file) {
                  const preview = document.getElementById('logo-preview');
                  const placeholder = document.getElementById('logo-placeholder');
                  preview.classList.remove('hidden');
                  placeholder.classList.add('hidden');
                }
              });
            `}} />
          </div>

          {/* Brand Colors */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Brand Colors</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.primary_color}
                    onChange={e => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="h-12 w-16 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primary_color}
                    onChange={e => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.secondary_color}
                    onChange={e => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="h-12 w-16 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondary_color}
                    onChange={e => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.accent_color}
                    onChange={e => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="h-12 w-16 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accent_color}
                    onChange={e => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Brand Identity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Brand Identity</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mission Statement
                </label>
                <textarea
                  value={formData.mission_statement}
                  onChange={e => setFormData(prev => ({ ...prev, mission_statement: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="What is your brand's purpose and mission?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Voice
                </label>
                <select
                  value={formData.brand_voice}
                  onChange={e => setFormData(prev => ({ ...prev, brand_voice: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="playful">Playful</option>
                  <option value="inspirational">Inspirational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Personality
                </label>
                <input
                  type="text"
                  value={formData.brand_personality}
                  onChange={e => setFormData(prev => ({ ...prev, brand_personality: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Innovative, Bold, Trustworthy, Minimalist"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.target_audience}
                  onChange={e => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Young professionals aged 25-40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Values (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.key_values}
                  onChange={e => setFormData(prev => ({ ...prev, key_values: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Quality, Innovation, Customer First"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={e => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Default Brand Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={e => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
              Set as default brand package (will be used for new campaigns)
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6 border-t">
            <Link
              href="/brand-packages"
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Brand Package...' : 'Create Brand Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
