'use client';

import Link from 'next/link';
import {
  Sparkles,
  Video,
  Wand2,
  Calendar,
  TrendingUp,
  BarChart3,
  Zap,
  Users,
  Globe,
  Shield,
  Clock,
  Target,
  ArrowRight,
  Check,
  Rocket
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function FeaturesPage() {
  const mainFeatures = [
    {
      icon: Wand2,
      title: 'AI Image Generation',
      description: 'Create professional images and product scenes with AI',
      details: [
        'Text-to-image using Flux Pro, SDXL, and Qwen-VL',
        'Product photography with virtual placement',
        'Multiple aspect ratios (1:1, 16:9, 9:16, 4:5)',
        'Photorealistic commercial quality',
        'Lifestyle scene generation',
        'E-commerce ready images'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Video,
      title: 'AI Video Generation',
      description: 'Transform your ideas into stunning videos in seconds',
      details: [
        'Text-to-video AI powered by advanced models',
        'Multiple aspect ratios (9:16, 16:9, 1:1)',
        'Customizable styles and themes',
        'Automatic scene transitions',
        'Brand watermark support',
        'HD quality exports'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Wand2,
      title: 'Smart Content Creator',
      description: 'AI-powered scripts, captions, and hashtags',
      details: [
        'Platform-optimized content suggestions',
        'Trending hashtag recommendations',
        'Engaging caption generation',
        'Multi-language support',
        'Tone and voice customization',
        'SEO-optimized descriptions'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Calendar,
      title: 'Multi-Platform Scheduling',
      description: 'Post everywhere from one dashboard',
      details: [
        'Instagram, TikTok, YouTube, Facebook, LinkedIn',
        'Optimal posting time suggestions',
        'Bulk upload and scheduling',
        'Content calendar view',
        'Queue management',
        'Time zone support'
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track performance across all platforms',
      details: [
        'Real-time engagement metrics',
        'Follower growth tracking',
        'Content performance analysis',
        'Competitor insights',
        'Custom reports',
        'ROI tracking'
      ],
      color: 'from-orange-500 to-red-500'
    }
  ];

  const additionalFeatures = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Generate videos in under 60 seconds'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together with your team seamlessly'
    },
    {
      icon: Globe,
      title: 'Multi-Language',
      description: 'Create content in 50+ languages'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and data protection'
    },
    {
      icon: Clock,
      title: 'Save 15+ Hours/Week',
      description: 'Automate your entire content workflow'
    },
    {
      icon: Target,
      title: 'Smart Targeting',
      description: 'Reach the right audience at the right time'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header/Navigation */}
      <nav className="border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">SocialSync</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">Home</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" size="sm">Pricing</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">Start For Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary-500)]/10 border border-[var(--primary-500)]/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[var(--primary-500)]" />
            <span className="text-sm font-medium text-[var(--primary-500)]">
              Everything You Need to Dominate Social Media
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-6">
            Powerful Features for
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)]">
              Modern Creators
            </span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-3xl mx-auto">
            Create, schedule, and grow your social media presence with AI-powered tools designed for efficiency and results.
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, i) => (
              <Card key={i} variant="glass" padding="lg" className="hover:scale-105 transition-transform">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  {feature.title}
                </h3>

                <p className="text-[var(--text-secondary)] mb-4 text-sm">
                  {feature.description}
                </p>

                <ul className="space-y-2">
                  {feature.details.slice(0, 3).map((detail, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-[var(--text-secondary)]">{detail}</span>
                    </li>
                  ))}
                  {feature.details.length > 3 && (
                    <li className="text-xs text-[var(--primary-500)] font-medium pt-1">
                      +{feature.details.length - 3} more features
                    </li>
                  )}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 px-6 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              And That's Not All
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">
              More features to help you succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, i) => (
              <Card key={i} variant="glass" padding="lg" className="text-center hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-[var(--primary-500)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              How SocialSync Works
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">
              From idea to published content in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="glass" padding="lg" className="text-center hover:scale-105 transition-transform">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Generate Content
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Describe your video idea or let AI suggest trending topics. Get scripts, captions, and hashtags instantly.
              </p>
            </Card>

            <Card variant="glass" padding="lg" className="text-center hover:scale-105 transition-transform">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Schedule & Post
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Choose your platforms, set your schedule, or publish immediately. SocialSync handles the rest.
              </p>
            </Card>

            <Card variant="glass" padding="lg" className="text-center hover:scale-105 transition-transform">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Analyze & Grow
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Track performance, understand what works, and optimize your strategy with AI-powered insights.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[var(--primary-500)]/10 to-[var(--secondary-500)]/10 border-y-2 border-[var(--primary-500)]/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
            Ready to Transform Your Social Media?
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            Join early adopters who are already creating viral content with SocialSync.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button variant="primary" size="lg" className="shadow-lg shadow-[var(--primary-500)]/30">
                <Rocket className="w-5 h-5 mr-2" />
                Start For Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                View Pricing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-[var(--text-tertiary)] mt-6">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[var(--bg-secondary)] border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-[var(--text-primary)]">SocialSync</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                AI-powered social media management for modern creators.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--text-tertiary)]">
            © 2025 SocialSync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
