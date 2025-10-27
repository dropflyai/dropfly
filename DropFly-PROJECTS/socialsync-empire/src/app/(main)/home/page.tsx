import { Sparkles, Video, Calendar, TrendingUp, Eye, Heart, Download, Zap, Award, Film, Coins, Wand2, Package } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SUBSCRIPTION_TIERS, getEnginesForTier } from '@/lib/video-engines/config';
import { tokenService } from '@/lib/tokens/token-service';
import { BuyTokensButton } from '@/components/billing/BuyTokensButton';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there';

  // Get user's subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const userTier = profile?.subscription_tier || 'free';
  const subscriptionInfo = SUBSCRIPTION_TIERS.find((t) => t.id === userTier);

  // Get video generation usage
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: videoUsage } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', user.id)
    .eq('resource_type', 'video_generation')
    .eq('period', currentMonth)
    .single();

  const videoCreditsUsed = videoUsage?.usage_count || 0;
  const videoCreditsTotal = subscriptionInfo?.videoCredits || 3;
  const videoCreditsRemaining = videoCreditsTotal - videoCreditsUsed;
  const videoUsagePercentage = (videoCreditsUsed / videoCreditsTotal) * 100;

  // Get available engines
  const availableEngines = getEnginesForTier(userTier);

  // Get token balance and daily limit info
  const tokenBalance = await tokenService.getBalance(user.id);
  const dailyInfo = await tokenService.getDailyLimitInfo(user.id);

  const tokensAvailable = tokenBalance?.balance || 0;
  const dailySpent = dailyInfo?.dailySpent || 0;
  const dailyLimit = dailyInfo?.dailyLimit || 0;
  const dailyRemaining = dailyInfo?.dailyRemaining || 0;
  const dailyUsagePercentage = dailyInfo?.percentageUsed || 0;

  // Get recent videos
  const { data: recentVideos } = await supabase
    .from('content')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'video')
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-[var(--text-secondary)]">
          {videoCreditsUsed === 0
            ? 'Get started by creating your first AI-powered video below'
            : 'Here's what's happening with your content today'}
        </p>
      </div>

      {/* Welcome Guide for New Users */}
      {videoCreditsUsed === 0 && (
        <Card
          variant="glass"
          padding="lg"
          className="bg-gradient-to-br from-[var(--primary-500)]/5 to-[var(--secondary-500)]/5 border-2 border-[var(--primary-500)]/10"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                🎉 Welcome to SocialSync Empire!
              </h3>
              <p className="text-[var(--text-secondary)] mb-4">
                You're all set! Here's how to get started:
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary-500)] text-white flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Create your first AI video
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Click "Generate Video" below to create AI-powered content in seconds
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary-500)] text-white flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Connect your social accounts
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Link your platforms to schedule posts and track analytics
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary-500)] text-white flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Upgrade for more power
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Get access to premium AI engines and unlimited videos
                    </p>
                  </div>
                </div>
              </div>
              <Link href="/create">
                <Button variant="primary" size="lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Your First Video
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Token Balance & Daily Limits - Featured */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Token Balance Card */}
        <Card
          variant="glass"
          padding="lg"
          className="bg-gradient-to-br from-[var(--secondary-500)]/10 to-[var(--primary-500)]/10 border-2 border-[var(--secondary-500)]/20"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-6 h-6 text-[var(--secondary-500)]" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Token Balance
                </h3>
              </div>
              <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">
                {tokensAvailable.toLocaleString()}
              </p>
              <p className="text-sm text-[var(--text-tertiary)]">
                Available for video generation
              </p>
            </div>
            <BuyTokensButton
              variant="secondary"
              size="sm"
              currentBalance={tokensAvailable}
            />
          </div>
        </Card>

        {/* Daily Limit Card */}
        <Card
          variant="glass"
          padding="lg"
          className="bg-gradient-to-br from-[var(--warning)]/10 to-[var(--primary-500)]/10 border-2 border-[var(--warning)]/20"
        >
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-[var(--warning)]" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Daily Usage
              </h3>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {dailySpent}
              </p>
              <p className="text-sm text-[var(--text-tertiary)]">
                / {dailyLimit} tokens today
              </p>
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">
              {dailyRemaining} tokens remaining today
            </p>
          </div>

          {/* Daily Progress Bar */}
          <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                dailyUsagePercentage >= 100
                  ? 'bg-red-500'
                  : dailyUsagePercentage >= 80
                  ? 'bg-[var(--warning)]'
                  : 'bg-gradient-to-r from-[var(--warning)] to-[var(--primary-500)]'
              }`}
              style={{ width: `${Math.min(dailyUsagePercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Resets daily at midnight
          </p>
        </Card>
      </div>

      {/* Video Credits Card - Featured */}
      <Card
        variant="glass"
        padding="lg"
        className="bg-gradient-to-br from-[var(--primary-500)]/10 to-[var(--secondary-500)]/10 border-2 border-[var(--primary-500)]/20"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Film className="w-6 h-6 text-[var(--primary-500)]" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                AI Video Credits
              </h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-[var(--primary-500)] text-white rounded-full">
                {userTier.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">
              {videoCreditsRemaining} of {videoCreditsTotal} videos remaining this month
            </p>
          </div>
          <Link href="/create">
            <Button variant="primary" size="sm">
              <Sparkles className="w-4 h-4 mr-1" />
              Generate Video
            </Button>
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                videoUsagePercentage >= 100
                  ? 'bg-red-500'
                  : videoUsagePercentage >= 80
                  ? 'bg-[var(--warning)]'
                  : 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)]'
              }`}
              style={{ width: `${Math.min(videoUsagePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Available Engines */}
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">
            {availableEngines.length} AI Engine{availableEngines.length !== 1 ? 's' : ''} Available:
          </p>
          <div className="flex flex-wrap gap-2">
            {availableEngines.slice(0, 5).map((engine) => (
              <div
                key={engine.id}
                className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--bg-elevated)] rounded-lg flex items-center gap-2"
              >
                {engine.badge === '#1 Ranked' && <Award className="w-3 h-3 text-[var(--primary-500)]" />}
                {engine.badge === '3x Faster' && <Zap className="w-3 h-3 text-[var(--primary-500)]" />}
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  {engine.displayName}
                </span>
                {engine.badge && (
                  <span className="text-xs text-[var(--text-tertiary)]">• {engine.badge}</span>
                )}
              </div>
            ))}
            {availableEngines.length > 5 && (
              <div className="px-3 py-1.5 text-xs text-[var(--text-tertiary)]">
                +{availableEngines.length - 5} more
              </div>
            )}
          </div>
        </div>

        {/* Upgrade CTA if needed */}
        {videoCreditsRemaining === 0 && (
          <div className="mt-4 p-3 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg">
            <p className="text-sm text-[var(--warning)] font-medium">
              🚀 You've used all your video credits this month!
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Upgrade to generate more AI videos with premium engines
            </p>
            <Link href="/pricing">
              <Button variant="primary" size="sm" className="mt-2">
                View Plans
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/create">
            <Card variant="glass" padding="lg" clickable hover>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">Create AI Video</h3>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    {availableEngines.length} engines available
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/tools/image-generator">
            <Card variant="glass" padding="lg" clickable hover>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">AI Image Generator</h3>
                  <p className="text-sm text-[var(--text-tertiary)]">Text-to-image creation</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/tools/product-studio">
            <Card variant="glass" padding="lg" clickable hover>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">Product Studio</h3>
                  <p className="text-sm text-[var(--text-tertiary)]">Lifestyle product scenes</p>
                </div>
              </div>
            </Card>
          </Link>

          <Card variant="glass" padding="lg" clickable hover>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[var(--accent-500)] to-[var(--primary-500)] rounded-lg">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Download Video</h3>
                <p className="text-sm text-[var(--text-tertiary)]">From any platform</p>
              </div>
            </div>
          </Card>

          <Link href="/post">
            <Card variant="glass" padding="lg" clickable hover>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-[var(--secondary-500)] to-[var(--primary-500)] rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">Schedule Post</h3>
                  <p className="text-sm text-[var(--text-tertiary)]">Plan your content</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Stats Overview */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">This Month</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-2">
              <Video className="w-5 h-5 text-[var(--primary-500)]" />
              <span className="text-sm text-[var(--text-tertiary)]">Videos Created</span>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{videoCreditsUsed}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {videoCreditsRemaining} credits left
            </p>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-[var(--secondary-500)]" />
              <span className="text-sm text-[var(--text-tertiary)]">Total Views</span>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">0</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {videoCreditsUsed === 0 ? 'Create your first video' : 'Connect accounts to track'}
            </p>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-[var(--accent-500)]" />
              <span className="text-sm text-[var(--text-tertiary)]">Engagement</span>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">0</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {videoCreditsUsed === 0 ? 'Create your first video' : 'Connect accounts to track'}
            </p>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-[var(--success)]" />
              <span className="text-sm text-[var(--text-tertiary)]">Reach</span>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">0</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {videoCreditsUsed === 0 ? 'Create your first video' : 'Connect accounts to track'}
            </p>
          </Card>
        </div>
      </section>

      {/* Recent Videos */}
      {recentVideos && recentVideos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Recent AI Videos</h2>
            <Link href="/library">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentVideos.map((video) => (
              <Card key={video.id} padding="lg" hover clickable>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--secondary-500)]/20 rounded-lg flex items-center justify-center">
                    <Video className="w-8 h-8 text-[var(--primary-500)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1 line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {video.content?.engineName || 'AI Generated'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded-full bg-[var(--success)]/20 text-[var(--success)]">
                    {video.status}
                  </span>
                  {video.metadata?.duration && (
                    <span className="text-sm text-[var(--text-tertiary)]">
                      {video.metadata.duration}s
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Trending Topics */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            🔥 Trending Topics
          </h2>
        </div>

        <Card padding="lg">
          <div className="space-y-4">
            {[
              {
                topic: 'AI video generation tips',
                mentions: '48.3K',
                trend: 'Rising fast',
                level: 'hot',
              },
              {
                topic: 'Multi-platform content strategy',
                mentions: '24.7K',
                trend: 'Steady growth',
                level: 'trending',
              },
              {
                topic: 'Video automation workflows',
                mentions: '15.2K',
                trend: 'New',
                level: 'growing',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-[var(--bg-tertiary)] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {item.level === 'hot' ? '🔥🔥🔥🔥' : item.level === 'trending' ? '🔥🔥🔥' : '🔥🔥'}
                  </span>
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">{item.topic}</h4>
                    <p className="text-sm text-[var(--text-tertiary)]">
                      {item.mentions} mentions • {item.trend}
                    </p>
                  </div>
                </div>
                <Link href="/create">
                  <Button variant="ghost" size="sm">
                    Create Video
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
