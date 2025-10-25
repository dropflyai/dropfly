'use client';

import {
  Folder,
  Download,
  Paintbrush,
  Crop,
  FileVideo,
  Image,
  Grid3x3,
  Mic,
  User,
  BarChart3,
  Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ManagePage() {
  const router = useRouter();

  const toolRoutes: Record<string, string> = {
    downloader: '/tools/downloader',
    watermark: '/tools/watermark',
    cropper: '/tools/cropper',
    converter: '/tools/converter',
    thumbnail: '/tools/thumbnail',
    coverart: '/tools/coverart',
  };

  const tools = [
    {
      id: 'downloader',
      name: 'Video Downloader',
      icon: Download,
      color: 'from-blue-500 to-cyan-500',
      description: 'Download videos from YouTube, TikTok, Instagram & more',
      badge: 'Unlimited',
      available: true,
    },
    {
      id: 'watermark',
      name: 'Watermark Remover',
      icon: Paintbrush,
      color: 'from-red-500 to-pink-500',
      description: 'Remove watermarks from your videos with AI',
      badge: '20/month',
      available: true,
    },
    {
      id: 'cropper',
      name: 'Social Cropper',
      icon: Crop,
      color: 'from-emerald-500 to-teal-500',
      description: 'Crop videos for 50+ social media platforms',
      badge: 'All Platforms',
      available: true,
    },
    {
      id: 'converter',
      name: 'Format Converter',
      icon: FileVideo,
      color: 'from-purple-500 to-indigo-500',
      description: 'Convert videos between different formats',
      badge: 'All Formats',
      available: true,
    },
    {
      id: 'thumbnail',
      name: 'Thumbnail Generator',
      icon: Grid3x3,
      color: 'from-orange-500 to-red-500',
      description: 'Auto-generate multiple thumbnails',
      badge: 'Auto',
      available: true,
    },
    {
      id: 'coverart',
      name: 'Cover Art Creator',
      icon: Image,
      color: 'from-pink-500 to-rose-500',
      description: 'Create custom cover art from video frames',
      badge: 'New',
      available: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-[var(--accent-500)] to-[var(--primary-500)] rounded-lg">
            <Folder className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Manage</h1>
            <p className="text-[var(--text-secondary)]">Tools, assets, and settings</p>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="glass" padding="lg" clickable hover>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-full flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Brand Voice</h3>
              <p className="text-xs text-[var(--text-tertiary)]">Professional, inspiring</p>
            </div>
          </Card>

          <Card variant="glass" padding="lg" clickable hover>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[var(--accent-500)] to-[var(--primary-500)] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">AI Avatars</h3>
              <p className="text-xs text-[var(--text-tertiary)]">2/2 avatars</p>
            </div>
          </Card>

          <Card variant="glass" padding="lg" clickable hover>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[var(--secondary-500)] to-[var(--primary-500)] rounded-full flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Media Library</h3>
              <p className="text-xs text-[var(--text-tertiary)]">120 files</p>
            </div>
          </Card>

          <Card variant="glass" padding="lg" clickable hover>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[var(--success)] to-[var(--secondary-500)] rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Analytics</h3>
              <p className="text-xs text-[var(--text-tertiary)]">Last 7 days</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Video Tools */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">🛠️ Video Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                variant="glass"
                padding="lg"
                clickable
                hover
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 bg-gradient-to-br ${tool.color} rounded-lg flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        {tool.name}
                      </h3>
                      {tool.badge && (
                        <span className="text-xs px-2 py-0.5 bg-[var(--primary-500)]/20 text-[var(--primary-400)] rounded-full">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-tertiary)] mb-3">
                      {tool.description}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      onClick={() => router.push(toolRoutes[tool.id])}
                    >
                      Launch Tool
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Brand & Content */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">🎨 Brand & Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Voice */}
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <Mic className="w-5 h-5 text-[var(--primary-500)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Brand Voice</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Current brand: <strong>Creative Studio</strong>
            </p>
            <p className="text-sm text-[var(--text-tertiary)] mb-4">
              Voice style: Professional, inspiring, authentic
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">Edit Brand Voice</Button>
              <Button variant="ghost" size="sm">Scan Website</Button>
            </div>
          </Card>

          {/* AI Avatars */}
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-[var(--primary-500)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">AI Avatars</h3>
            </div>
            <div className="flex gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-full"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent-500)] to-[var(--primary-500)] rounded-full"></div>
              <button className="w-16 h-16 border-2 border-dashed border-[var(--bg-elevated)] rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:border-[var(--primary-500)] hover:text-[var(--primary-500)] transition-colors">
                <span className="text-2xl">+</span>
              </button>
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mb-3">
              2/2 avatars used (Starter plan)
            </p>
            <Button variant="secondary" size="sm">Manage Avatars</Button>
          </Card>
        </div>
      </section>

      {/* Analytics */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">📊 Analytics (Last 7 Days)</h2>
        <Card padding="lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-[var(--text-tertiary)] mb-1">Views</p>
              <p className="text-3xl font-bold text-[var(--text-primary)]">45.2K</p>
              <p className="text-xs text-[var(--success)] mt-1">+12% this week</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-tertiary)] mb-1">Engagement</p>
              <p className="text-3xl font-bold text-[var(--text-primary)]">1.8K</p>
              <p className="text-xs text-[var(--success)] mt-1">+8% this week</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-tertiary)] mb-1">Reach</p>
              <p className="text-3xl font-bold text-[var(--text-primary)]">62.1K</p>
              <p className="text-xs text-[var(--success)] mt-1">+15% this week</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-tertiary)] mb-1">Avg Rating</p>
              <p className="text-3xl font-bold text-[var(--text-primary)]">4.2</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">⭐⭐⭐⭐☆</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-[var(--bg-tertiary)]">
            <Button variant="ghost" size="sm">View Full Analytics</Button>
          </div>
        </Card>
      </section>

      {/* Settings */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">⚙️ Settings</h2>
        <Card padding="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-left">
              <Settings className="w-5 h-5 text-[var(--text-tertiary)]" />
              <div>
                <h4 className="font-medium text-[var(--text-primary)]">Profile & Preferences</h4>
                <p className="text-xs text-[var(--text-tertiary)]">Update your account settings</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-left">
              <Download className="w-5 h-5 text-[var(--text-tertiary)]" />
              <div>
                <h4 className="font-medium text-[var(--text-primary)]">Connected Platforms</h4>
                <p className="text-xs text-[var(--text-tertiary)]">2/2 platforms connected</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-left">
              <Grid3x3 className="w-5 h-5 text-[var(--text-tertiary)]" />
              <div>
                <h4 className="font-medium text-[var(--text-primary)]">Billing & Subscription</h4>
                <p className="text-xs text-[var(--text-tertiary)]">Starter - $29/month</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-left">
              <User className="w-5 h-5 text-[var(--text-tertiary)]" />
              <div>
                <h4 className="font-medium text-[var(--text-primary)]">Support & Help</h4>
                <p className="text-xs text-[var(--text-tertiary)]">Get help and documentation</p>
              </div>
            </button>
          </div>
        </Card>
      </section>
    </div>
  );
}
