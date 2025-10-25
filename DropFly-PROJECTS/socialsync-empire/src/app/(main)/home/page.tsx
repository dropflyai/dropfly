import { Sparkles, Video, Calendar, TrendingUp, Eye, Heart, MessageCircle, Download } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there';

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-[var(--text-secondary)]">
          Here's what's happening with your content today
        </p>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="glass" padding="lg" clickable hover>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Create AI Video</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Generate with AI</p>
              </div>
            </div>
          </Card>

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
        </div>
      </section>

      {/* Stats Overview */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">This Week</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-2">
              <Video className="w-5 h-5 text-[var(--primary-500)]" />
              <span className="text-sm text-[var(--text-tertiary)]">Videos</span>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">12</p>
            <p className="text-xs text-[var(--success)] mt-1">+3 from last week</p>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-[var(--secondary-500)]" />
              <span className="text-sm text-[var(--text-tertiary)]">Views</span>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">45.2K</p>
            <p className="text-xs text-[var(--success)] mt-1">+12% this week</p>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-[var(--accent-500)]" />
              <span className="text-sm text-[var(--text-tertiary)]">Engagement</span>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">1.8K</p>
            <p className="text-xs text-[var(--success)] mt-1">+8% this week</p>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-[var(--success)]" />
              <span className="text-sm text-[var(--text-tertiary)]">Reach</span>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">62.1K</p>
            <p className="text-xs text-[var(--success)] mt-1">+15% this week</p>
          </Card>
        </div>
      </section>

      {/* Recent Projects */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Recent Projects</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Tutorial: Instagram Reels',
              status: 'Published',
              views: '1.2K',
              platform: 'Instagram, TikTok',
              color: 'success',
            },
            {
              title: 'Product Review: AI Tools',
              status: 'Scheduled',
              time: 'Today at 2:00 PM',
              platform: 'YouTube',
              color: 'warning',
            },
            {
              title: 'Trending: Algorithm Update',
              status: 'Draft',
              progress: '60%',
              platform: 'All Platforms',
              color: 'info',
            },
          ].map((project, i) => (
            <Card key={i} padding="lg" hover clickable>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center">
                  <Video className="w-8 h-8 text-[var(--text-tertiary)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)]">{project.platform}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    project.color === 'success'
                      ? 'bg-[var(--success)]/20 text-[var(--success)]'
                      : project.color === 'warning'
                      ? 'bg-[var(--warning)]/20 text-[var(--warning)]'
                      : 'bg-[var(--info)]/20 text-[var(--info)]'
                  }`}
                >
                  {project.status}
                </span>
                {project.views && (
                  <span className="text-sm text-[var(--text-tertiary)]">
                    👀 {project.views}
                  </span>
                )}
                {project.time && (
                  <span className="text-xs text-[var(--text-tertiary)]">{project.time}</span>
                )}
                {project.progress && (
                  <span className="text-xs text-[var(--text-tertiary)]">{project.progress}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Trending Topics */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            🔥 Trending Topics
          </h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>

        <Card padding="lg">
          <div className="space-y-4">
            {[
              {
                topic: 'Instagram algorithm changed again',
                mentions: '24.5K',
                trend: 'Rising fast',
                level: 'hot',
              },
              {
                topic: 'AI video tools comparison',
                mentions: '12.3K',
                trend: 'Steady growth',
                level: 'trending',
              },
              {
                topic: 'Best time to post on TikTok',
                mentions: '8.1K',
                trend: 'New',
                level: 'growing',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-[var(--bg-tertiary)] last:border-0">
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
                <Button variant="ghost" size="sm">Use This Trend</Button>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
