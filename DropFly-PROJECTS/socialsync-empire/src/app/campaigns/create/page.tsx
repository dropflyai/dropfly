'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BrandPackage {
  id: string;
  name: string;
  logo_url: string;
  primary_color: string;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenInfo, setTokenInfo] = useState<{ required: number; current: number } | null>(null);
  const [brandPackages, setBrandPackages] = useState<BrandPackage[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    niche: '',
    description: '',
    platforms: [] as string[],
    frequency: 'daily',
    post_times: ['09:00'],
    timezone: 'America/New_York',
    creator_mode: 'ugc',
    video_duration_min: 30,
    video_duration_max: 60,
    content_style: '',
    target_audience: '',
    key_messages: '',
    brand_package_id: ''
  });

  const platformOptions = [
    { id: 'tiktok', label: 'TikTok', icon: '🎵' },
    { id: 'instagram', label: 'Instagram', icon: '📷' },
    { id: 'youtube', label: 'YouTube', icon: '▶️' },
    { id: 'facebook', label: 'Facebook', icon: '👥' },
    { id: 'twitter', label: 'Twitter/X', icon: '🐦' },
    { id: 'linkedin', label: 'LinkedIn', icon: '💼' }
  ];

  const creatorModes = [
    { id: 'ugc', label: 'UGC', description: 'User-generated content style' },
    { id: 'educational', label: 'Educational', description: 'Teaching and informative' },
    { id: 'entertainment', label: 'Entertainment', description: 'Fun and engaging' },
    { id: 'review', label: 'Review', description: 'Product reviews' },
    { id: 'tutorial', label: 'Tutorial', description: 'Step-by-step guides' }
  ];

  // Fetch brand packages on mount
  useEffect(() => {
    async function fetchBrandPackages() {
      try {
        const res = await fetch('/api/brand-packages');
        if (res.ok) {
          const data = await res.json();
          setBrandPackages(data.brandPackages || []);
          // Set default brand if exists
          const defaultBrand = data.brandPackages?.find((bp: any) => bp.is_default);
          if (defaultBrand) {
            setFormData(prev => ({ ...prev, brand_package_id: defaultBrand.id }));
          }
        }
      } catch (error) {
        console.error('Error fetching brand packages:', error);
      }
    }
    fetchBrandPackages();
  }, []);

  function togglePlatform(platform: string) {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  }

  function addPostTime() {
    setFormData(prev => ({
      ...prev,
      post_times: [...prev.post_times, '12:00']
    }));
  }

  function removePostTime(index: number) {
    setFormData(prev => ({
      ...prev,
      post_times: prev.post_times.filter((_, i) => i !== index)
    }));
  }

  function updatePostTime(index: number, value: string) {
    setFormData(prev => ({
      ...prev,
      post_times: prev.post_times.map((time, i) => i === index ? value : time)
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTokenInfo(null);

    try {
      // Parse key_messages from comma-separated string to array
      const payload = {
        ...formData,
        key_messages: formData.key_messages
          ? formData.key_messages.split(',').map(m => m.trim()).filter(Boolean)
          : []
      };

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errorCode === 'INSUFFICIENT_TOKENS') {
          setTokenInfo({ required: data.required, current: data.current });
          setError(data.message || 'Insufficient tokens');
        } else {
          setError(data.error || 'Failed to create campaign');
        }
        return;
      }

      // Success - redirect to campaigns list
      router.push('/campaigns');
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
          <Link href="/campaigns" className="text-purple-600 hover:text-purple-700 mb-4 inline-block">
            ← Back to Campaigns
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Campaign
          </h1>
          <p className="text-gray-600">
            Set up an automated content campaign that runs on autopilot
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
            {tokenInfo && (
              <div className="mt-2 text-sm text-red-700">
                <p>You have {tokenInfo.current} tokens, but need {tokenInfo.required} tokens to run this campaign for 1 week.</p>
                <Link href="/pricing" className="underline font-medium">
                  Get more tokens →
                </Link>
              </div>
            )}
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
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Daily Tech Tips"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niche/Topic *
                </label>
                <input
                  type="text"
                  required
                  value={formData.niche}
                  onChange={e => setFormData(prev => ({ ...prev, niche: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Technology, Health & Fitness, Business"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description of your campaign goals..."
                />
              </div>
            </div>
          </div>

          {/* Brand Package */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Brand Package (Optional)</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a brand package to personalize your content with your brand voice, colors, and mission.
            </p>

            <select
              value={formData.brand_package_id}
              onChange={e => setFormData(prev => ({ ...prev, brand_package_id: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">No Brand (Generic Content)</option>
              {brandPackages.map(bp => (
                <option key={bp.id} value={bp.id}>
                  {bp.name}
                </option>
              ))}
            </select>

            {brandPackages.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Don't have a brand package yet?{' '}
                <Link href="/brand-packages/create" className="text-purple-600 hover:underline">
                  Create one →
                </Link>
              </p>
            )}
          </div>

          {/* Platforms */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Publishing Platforms *</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {platformOptions.map(platform => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => togglePlatform(platform.id)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.platforms.includes(platform.id)
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{platform.icon}</div>
                  <div className="font-medium text-gray-900">{platform.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Posting Schedule *</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={e => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="3x_week">3x per Week</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Times
                </label>
                {formData.post_times.map((time, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="time"
                      value={time}
                      onChange={e => updatePostTime(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {formData.post_times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePostTime(index)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPostTime}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  + Add Another Time
                </button>
              </div>
            </div>
          </div>

          {/* Content Settings */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Creator Mode
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {creatorModes.map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, creator_mode: mode.id }))}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.creator_mode === mode.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{mode.label}</div>
                      <div className="text-sm text-gray-600">{mode.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Style (Optional)
                </label>
                <input
                  type="text"
                  value={formData.content_style}
                  onChange={e => setFormData(prev => ({ ...prev, content_style: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Conversational, Professional, Humorous"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience (Optional)
                </label>
                <input
                  type="text"
                  value={formData.target_audience}
                  onChange={e => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Young professionals, Small business owners"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Messages (Optional, comma-separated)
                </label>
                <textarea
                  value={formData.key_messages}
                  onChange={e => setFormData(prev => ({ ...prev, key_messages: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Quality over quantity, Always innovating, Customer first"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6 border-t">
            <Link
              href="/campaigns"
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || formData.platforms.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Campaign...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
