'use client';

import { Sparkles, Download, Send, TrendingUp, Video, FileText, DollarSign, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function HomePage() {
  const quickActions = [
    {
      icon: Sparkles,
      label: 'AI Video',
      subtitle: 'Text to video',
      gradient: 'from-blue-500 to-purple-600',
      action: () => console.log('AI Video'),
    },
    {
      icon: Download,
      label: 'Download',
      subtitle: 'Get video',
      gradient: 'from-green-500 to-emerald-600',
      action: () => console.log('Download'),
    },
    {
      icon: Send,
      label: 'Post Now',
      subtitle: 'Quick share',
      gradient: 'from-pink-500 to-rose-600',
      action: () => console.log('Post'),
    },
  ];

  const stats = [
    { label: 'Posts Today', value: '12', icon: FileText, color: 'text-blue-400' },
    { label: 'Margin', value: '370%', icon: TrendingUp, color: 'text-green-400' },
    { label: 'Earned', value: '$45', icon: DollarSign, color: 'text-purple-400' },
  ];

  const recentProjects = [
    {
      id: 1,
      title: 'AI Tips for 2024',
      platform: 'TikTok',
      time: '2h ago',
      thumbnail: '/placeholder-video.jpg',
      stats: { views: '1.2K', likes: '245', comments: '12' },
      status: 'posted' as const,
    },
    {
      id: 2,
      title: 'Product Launch Video',
      platform: 'Instagram',
      time: '5h ago',
      thumbnail: '/placeholder-video.jpg',
      stats: null,
      status: 'draft' as const,
    },
    {
      id: 3,
      title: 'Morning Routine Tips',
      platform: 'YouTube',
      time: '1d ago',
      thumbnail: '/placeholder-video.jpg',
      stats: { views: '3.5K', likes: '421', comments: '34' },
      status: 'posted' as const,
    },
  ];

  const trendingTopics = [
    { topic: 'AI automation tools', growth: '+245%', hot: true },
    { topic: 'Social media growth hacks', growth: '+180%', hot: true },
    { topic: 'Make money online 2024', growth: '+156%', hot: false },
    { topic: 'Remote work productivity', growth: '+98%', hot: false },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Hey Rio, what will you create today?
        </h2>
        <p className="text-gray-400">Your AI content studio is ready</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className={`
                p-4 md:p-6 rounded-2xl
                bg-gradient-to-br ${action.gradient}
                hover:scale-105 active:scale-95
                transition-all duration-200
                shadow-lg
              `}
            >
              <Icon className="w-6 h-6 md:w-8 md:h-8 text-white mb-2 mx-auto" />
              <p className="text-white font-semibold text-sm md:text-base">{action.label}</p>
              <p className="text-white/70 text-xs mt-1">{action.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Today's Stats */}
      <Card variant="glass" padding="lg">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Today's Stats
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs md:text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-400" />
            Recent Projects
          </h3>
          <button className="text-sm text-blue-400 hover:text-blue-300">
            See All →
          </button>
        </div>

        <div className="space-y-3">
          {recentProjects.map((project) => (
            <Card key={project.id} variant="glass" padding="md" clickable hover>
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Video className="w-8 h-8 text-gray-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-white truncate">{project.title}</h4>
                    <Badge variant={project.status === 'posted' ? 'success' : 'warning'} size="sm">
                      {project.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-400 mb-3">
                    {project.platform} • {project.time}
                  </p>

                  {project.stats ? (
                    <div className="flex items-center gap-4 text-xs md:text-sm text-gray-400">
                      <span>👁️ {project.stats.views}</span>
                      <span>❤️ {project.stats.likes}</span>
                      <span>💬 {project.stats.comments}</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" variant="primary">Edit</Button>
                      <Button size="sm" variant="ghost">Post Now</Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <Card variant="glass" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-400" />
            Trending Topics
            <Badge variant="danger" size="sm">Live</Badge>
          </h3>
          <button className="text-sm text-blue-400 hover:text-blue-300">
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {trendingTopics.map((trend, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                {trend.hot && (
                  <span className="text-lg">🔥</span>
                )}
                <div>
                  <p className="text-white font-medium group-hover:text-blue-400 transition-colors">
                    {trend.topic}
                  </p>
                  <p className="text-xs text-gray-400">Create content from this trend</p>
                </div>
              </div>
              <Badge variant="success" size="sm">{trend.growth}</Badge>
            </button>
          ))}
        </div>

        <Button variant="primary" fullWidth className="mt-4">
          <Sparkles className="w-4 h-4" />
          Create from Trend
        </Button>
      </Card>
    </div>
  );
}
