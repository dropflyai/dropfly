'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface CampaignPost {
  id: string;
  topic: string;
  script: any;
  status: string;
  scheduled_for: string;
  published_at: string | null;
  created_at: string;
}

interface Campaign {
  id: string;
  name: string;
  niche: string;
  description: string;
  platforms: string[];
  frequency: string;
  post_times: string[];
  creator_mode: string;
  content_style: string;
  target_audience: string;
  key_messages: string[];
  status: string;
  total_posts: number;
  next_post_at: string;
  last_post_at: string | null;
  created_at: string;
  campaign_posts: CampaignPost[];
}

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  async function fetchCampaign() {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      if (!res.ok) throw new Error('Failed to fetch campaign');
      const data = await res.json();
      setCampaign(data.campaign);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleCampaignStatus() {
    if (!campaign) return;

    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    setActionLoading(true);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update campaign');

      // Refresh campaign data
      await fetchCampaign();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteCampaign() {
    if (!confirm('Are you sure you want to delete this campaign? This cannot be undone.')) {
      return;
    }

    setActionLoading(true);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete campaign');

      router.push('/campaigns');
    } catch (err: any) {
      alert(err.message);
      setActionLoading(false);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getFrequencyLabel(frequency: string) {
    const labels: Record<string, string> = {
      daily: 'Daily',
      '3x_week': '3x per Week',
      weekly: 'Weekly',
      custom: 'Custom'
    };
    return labels[frequency] || frequency;
  }

  function getPostStatusColor(status: string) {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800',
      generating_script: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      published: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-900 mb-2">Error</h2>
            <p className="text-red-700 mb-4">{error || 'Campaign not found'}</p>
            <Link href="/campaigns" className="text-purple-600 hover:text-purple-700 font-medium">
              ← Back to Campaigns
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/campaigns" className="text-purple-600 hover:text-purple-700 mb-4 inline-block">
            ← Back to Campaigns
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">{campaign.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
              <p className="text-gray-600">{campaign.niche}</p>
              {campaign.description && (
                <p className="text-gray-500 mt-2">{campaign.description}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={toggleCampaignStatus}
                disabled={actionLoading}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  campaign.status === 'active'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                } disabled:opacity-50`}
              >
                {campaign.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
              </button>
              <button
                onClick={deleteCampaign}
                disabled={actionLoading}
                className="px-6 py-3 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 transition-all disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Total Posts</div>
            <div className="text-3xl font-bold text-gray-900">{campaign.total_posts}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Frequency</div>
            <div className="text-3xl font-bold text-gray-900">{getFrequencyLabel(campaign.frequency)}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Next Post</div>
            <div className="text-lg font-bold text-gray-900">{formatDate(campaign.next_post_at)}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Platforms</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {campaign.platforms.map(platform => (
                <span key={platform} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Campaign Settings */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Campaign Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Creator Mode</div>
              <div className="text-lg text-gray-900 capitalize">{campaign.creator_mode}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Post Times</div>
              <div className="text-lg text-gray-900">{campaign.post_times.join(', ')}</div>
            </div>

            {campaign.content_style && (
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Content Style</div>
                <div className="text-lg text-gray-900">{campaign.content_style}</div>
              </div>
            )}

            {campaign.target_audience && (
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Target Audience</div>
                <div className="text-lg text-gray-900">{campaign.target_audience}</div>
              </div>
            )}

            {campaign.key_messages?.length > 0 && (
              <div className="md:col-span-2">
                <div className="text-sm font-medium text-gray-600 mb-1">Key Messages</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {campaign.key_messages.map((message, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm">
                      {message}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generated Posts */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Generated Posts</h2>

          {campaign.campaign_posts?.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No posts generated yet</h3>
              <p className="text-gray-600">
                Posts will be automatically generated according to your campaign schedule.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaign.campaign_posts?.map(post => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{post.topic}</h3>
                      <p className="text-sm text-gray-600">Created: {formatDate(post.created_at)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPostStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </div>

                  {post.script && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      {post.script.hook && (
                        <div className="mb-3">
                          <div className="text-xs font-medium text-gray-600 mb-1">HOOK</div>
                          <p className="text-sm text-gray-900">{post.script.hook}</p>
                        </div>
                      )}
                      {post.script.script && (
                        <div className="mb-3">
                          <div className="text-xs font-medium text-gray-600 mb-1">SCRIPT</div>
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{post.script.script}</p>
                        </div>
                      )}
                      {post.script.cta && (
                        <div className="mb-3">
                          <div className="text-xs font-medium text-gray-600 mb-1">CTA</div>
                          <p className="text-sm text-gray-900">{post.script.cta}</p>
                        </div>
                      )}
                      {post.script.hashtags && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {post.script.hashtags.map((tag: string, idx: number) => (
                            <span key={idx} className="text-xs text-purple-600">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
