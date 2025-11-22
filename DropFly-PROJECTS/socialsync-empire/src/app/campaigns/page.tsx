'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  niche: string;
  platforms: string[];
  frequency: string;
  status: string;
  total_posts: number;
  next_post_at: string;
  created_at: string;
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/campaigns');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      error: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getFrequencyLabel(frequency: string) {
    const labels: Record<string, string> = {
      daily: 'Daily',
      '3x_week': '3x/Week',
      weekly: 'Weekly',
      custom: 'Custom'
    };
    return labels[frequency] || frequency;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
              My Campaigns
            </h1>
            <p className="text-gray-600">
              Automated content campaigns running on autopilot
            </p>
          </div>
          <Link
            href="/campaigns/create"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            + Create Campaign
          </Link>
        </div>

        {/* Campaigns Grid */}
        {campaigns.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first automated campaign to start generating content
            </p>
            <Link
              href="/campaigns/create"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(campaign => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {campaign.total_posts} posts
                  </span>
                </div>

                {/* Campaign Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {campaign.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {campaign.niche}
                </p>

                {/* Platforms */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {campaign.platforms.map(platform => (
                    <span
                      key={platform}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                    >
                      {platform}
                    </span>
                  ))}
                </div>

                {/* Schedule */}
                <div className="border-t pt-4 text-sm text-gray-600">
                  <div className="flex justify-between mb-2">
                    <span>Frequency:</span>
                    <span className="font-medium">{getFrequencyLabel(campaign.frequency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next post:</span>
                    <span className="font-medium">
                      {formatDate(campaign.next_post_at)}
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
