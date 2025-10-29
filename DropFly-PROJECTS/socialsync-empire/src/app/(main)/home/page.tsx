import { Sparkles, Video, Calendar, TrendingUp, Eye, Heart, Download, Coins, Wand2, Package } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getEnginesForTier } from '@/lib/video-engines/config';
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

  // Check if user is first-time (no posts created yet)
  const { data: userPosts, count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { data: userContent, count: contentCount } = await supabase
    .from('content')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const isFirstTime = (postCount === 0 && contentCount === 0);

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
          {isFirstTime ? `Welcome, ${firstName}!` : `Welcome back, ${firstName}!`} 👋
        </h1>
        <p className="text-[var(--text-secondary)]">
          {isFirstTime
            ? 'Let\'s get you set up and ready to create viral content'
            : 'Here\'s what\'s happening with your content today'}
        </p>
      </div>

      {/* First-Time Onboarding - Connect Social Accounts */}
      {isFirstTime && (
        <Card
          variant="glass"
          padding="lg"
          className="bg-gradient-to-br from-[var(--primary-500)]/10 to-[var(--accent-500)]/10 border-2 border-[var(--primary-500)]/30"
        >
          <div className="flex items-start gap-4">
            <div className="p-4 bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent-500)] rounded-xl flex-shrink-0">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                  🎉 Welcome to SocialSync Empire!
                </h3>
                <span className="px-2 py-1 text-xs font-bold bg-[var(--accent-500)] text-white rounded-full animate-pulse">
                  STEP 1
                </span>
              </div>
              <p className="text-[var(--text-secondary)] mb-6 text-lg">
                First, let's connect your social media accounts so you can post and track your content
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--bg-elevated)]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">✅</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Post to multiple platforms</span>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] ml-6">TikTok, Instagram, YouTube & more</p>
                </div>
                <div className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--bg-elevated)]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📊</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Track analytics</span>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] ml-6">Views, engagement, and growth</p>
                </div>
                <div className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--bg-elevated)]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">⏰</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Schedule posts</span>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] ml-6">Automate your content calendar</p>
                </div>
                <div className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--bg-elevated)]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🚀</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Cross-post instantly</span>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] ml-6">One click to reach everywhere</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/post" className="flex-1">
                  <Button variant="primary" size="lg" className="w-full">
                    <Calendar className="w-5 h-5 mr-2" />
                    Connect Social Accounts
                  </Button>
                </Link>
                <Link href="/create">
                  <Button variant="ghost" size="lg">
                    Skip for now
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-[var(--text-tertiary)] mt-3 text-center">
                💡 You can connect accounts later in Settings, but we highly recommend doing it now
              </p>
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

      {/* Stats Overview - Only show if user has content */}
      {!isFirstTime && (
        <section>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">This Month</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card padding="lg">
              <div className="flex items-center gap-3 mb-2">
                <Video className="w-5 h-5 text-[var(--primary-500)]" />
                <span className="text-sm text-[var(--text-tertiary)]">Videos Created</span>
              </div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{contentCount || 0}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Total content pieces
              </p>
            </Card>

            <Card padding="lg">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-5 h-5 text-[var(--secondary-500)]" />
                <span className="text-sm text-[var(--text-tertiary)]">Total Views</span>
              </div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">-</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Connect accounts to track
              </p>
            </Card>

            <Card padding="lg">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-5 h-5 text-[var(--accent-500)]" />
                <span className="text-sm text-[var(--text-tertiary)]">Engagement</span>
              </div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">-</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Connect accounts to track
              </p>
            </Card>

            <Card padding="lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-[var(--success)]" />
                <span className="text-sm text-[var(--text-tertiary)]">Reach</span>
              </div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">-</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Connect accounts to track
              </p>
            </Card>
          </div>
        </section>
      )}

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
