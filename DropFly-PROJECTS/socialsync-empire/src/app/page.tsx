'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, Video, Calendar, TrendingUp, Download, Wand2,
  Instagram, Youtube, Twitter, Linkedin, Facebook,
  Check, Zap, Target, BarChart3, Scissors, FileVideo,
  Star, ArrowRight, Play, Users, Clock, Palette, Globe,
  Shield, Rocket, Brain, Repeat
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<'generate' | 'schedule' | 'grow' | null>(null);

  const features = [
    {
      icon: Video,
      title: 'AI Video Generation',
      description: 'Create professional videos from text prompts using cutting-edge AI models like Hailuo, Runway, and Luma.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Wand2,
      title: 'Smart Content Creator',
      description: 'Generate engaging video scripts, captions, and hashtags optimized for each platform automatically.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Calendar,
      title: 'Multi-Platform Scheduling',
      description: 'Schedule and post to Instagram, TikTok, YouTube, Facebook, and LinkedIn from one dashboard.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track performance, engagement, and growth across all platforms with detailed insights.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Scissors,
      title: 'Video Editing Suite',
      description: 'Trim, add captions, transitions, and effects to make your content stand out.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Brain,
      title: 'AI Optimization',
      description: 'Automatically optimize posting times, hashtags, and content for maximum engagement.',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const useCases = [
    {
      icon: Users,
      title: 'Content Creators',
      description: 'YouTubers, TikTokers, and influencers who need to produce content consistently across platforms.',
      benefit: 'Save 15+ hours/week'
    },
    {
      icon: Rocket,
      title: 'Marketing Agencies',
      description: 'Manage multiple client accounts and campaigns with team collaboration features.',
      benefit: 'Scale without hiring'
    },
    {
      icon: Globe,
      title: 'Small Businesses',
      description: 'Build your social presence without hiring a full-time social media manager.',
      benefit: 'Professional presence'
    },
    {
      icon: Target,
      title: 'E-commerce Brands',
      description: 'Showcase products with AI-generated videos and automated posting schedules.',
      benefit: 'Boost conversions'
    }
  ];

  const testimonials = [
    {
      name: 'Alex Rivera',
      role: 'Beta Tester',
      avatar: '👨‍💼',
      content: 'Finally, a tool that actually understands what creators need. The AI video generation is mind-blowing.',
      badge: 'Early Access'
    },
    {
      name: 'Jordan Lee',
      role: 'Digital Marketer',
      avatar: '👩',
      content: 'Been waiting for something like this. The scheduling features alone are worth it, but the AI videos? Game changer.',
      badge: 'Founding Member'
    },
    {
      name: 'Sam Taylor',
      role: 'Social Media Manager',
      avatar: '👨',
      content: 'This is what social media management should have been all along. Simple, powerful, and actually works.',
      badge: 'Beta Tester'
    }
  ];


  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[var(--bg-primary)]/80 backdrop-blur-lg border-b border-[var(--border)] z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">SocialSync</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Pricing
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary-500)]/10 border border-[var(--primary-500)]/20 rounded-full mb-6">
              <Zap className="w-4 h-4 text-[var(--primary-500)]" />
              <span className="text-sm font-medium text-[var(--primary-500)]">
                Early Access - Limited Spots Available
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
              AI-Powered Social Media,<br />
              <span className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-3xl mx-auto">
              Create stunning videos, schedule posts, and grow your audience across all platforms.
              All powered by AI. No video editing skills required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/signup">
                <Button variant="primary" size="lg">
                  <Rocket className="w-5 h-5 mr-2" />
                  Get Early Access Now
                </Button>
              </Link>
              <Button variant="outline" size="lg" onClick={() => setVideoPlaying(true)}>
                <Play className="w-5 h-5 mr-2" />
                Watch Demo (2 min)
              </Button>
            </div>

            <p className="text-sm text-[var(--warning)] font-medium mb-4">
              ⚡ Only 47 spots left at launch pricing
            </p>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-tertiary)]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Cancel anytime
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                24/7 support
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <Card variant="glass" padding="none" className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--secondary-500)]/20 flex items-center justify-center relative">
                <div className="absolute inset-0 grid grid-cols-3 gap-4 p-12">
                  {[
                    { icon: Video, label: 'Generate', desc: 'AI Videos', key: 'generate' as const },
                    { icon: Calendar, label: 'Schedule', desc: 'Auto-Post', key: 'schedule' as const },
                    { icon: TrendingUp, label: 'Grow', desc: 'Analytics', key: 'grow' as const }
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedFeature(item.key)}
                      className="bg-[var(--bg-primary)] rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 hover:scale-105 transition-transform shadow-md cursor-pointer hover:border-2 hover:border-[var(--primary-500)]"
                    >
                      <item.icon className="w-8 h-8 text-[var(--primary-500)]" />
                      <div className="text-center">
                        <div className="text-xs font-bold text-[var(--text-primary)]">{item.label}</div>
                        <div className="text-[10px] text-[var(--text-tertiary)]">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Launch Benefits Section */}
      <section className="py-16 px-6 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Join the Founding Members
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">
              Be among the first to experience next-gen social media automation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card variant="glass" padding="lg" className="text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Launch Pricing</h3>
              <p className="text-sm text-[var(--text-secondary)]">Lock in 50% off forever as a founding member</p>
            </Card>
            <Card variant="glass" padding="lg" className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Priority Support</h3>
              <p className="text-sm text-[var(--text-secondary)]">Direct line to founders + lifetime priority</p>
            </Card>
            <Card variant="glass" padding="lg" className="text-center">
              <div className="text-4xl mb-3">💎</div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Shape the Future</h3>
              <p className="text-sm text-[var(--text-secondary)]">Your feedback drives our roadmap</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
              From content creation to analytics, SocialSync has all the tools you need
              to build and grow your social media presence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card key={i} variant="glass" padding="lg" className="hover:scale-105 transition-transform">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section id="who-its-for" className="py-20 px-6 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              Built For Creators Like You
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
              Whether you're just starting or managing enterprise accounts,
              SocialSync scales with your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, i) => (
              <Card key={i} variant="glass" padding="lg">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-[var(--primary-500)]/10">
                    <useCase.icon className="w-8 h-8 text-[var(--primary-500)]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                        {useCase.title}
                      </h3>
                      <span className="text-sm text-[var(--primary-500)] font-medium">
                        {useCase.benefit}
                      </span>
                    </div>
                    <p className="text-[var(--text-secondary)]">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              What Early Users Are Saying
            </h2>
            <p className="text-xl text-[var(--text-secondary)]">
              Join our beta community and help shape the future
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} variant="glass" padding="lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="text-[var(--text-secondary)] mb-4">
                  "{testimonial.content}"
                </p>
                <div className="inline-block px-3 py-1 bg-[var(--primary-500)]/10 text-[var(--primary-500)] text-xs font-medium rounded-full">
                  {testimonial.badge}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[var(--primary-500)]/10 to-[var(--secondary-500)]/10 border-y-2 border-[var(--primary-500)]/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-[var(--warning)]/20 border border-[var(--warning)]/40 rounded-full mb-6">
            <span className="text-sm font-bold text-[var(--warning)]">
              ⚠️ Early Access Closing Soon - Only 47 Spots Left
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
            Don't Miss Launch Pricing
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            Lock in 50% off forever + lifetime priority support.
            <br />
            <strong className="text-[var(--text-primary)]">This offer expires when we hit 1,000 users.</strong>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/signup">
              <Button variant="primary" size="lg" className="shadow-lg shadow-[var(--primary-500)]/30">
                <Rocket className="w-5 h-5 mr-2" />
                Claim Your Spot Now
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                See Pricing Details
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-[var(--text-tertiary)]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              14-day money-back guarantee
            </div>
          </div>
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

      {/* Feature Modal */}
      {selectedFeature && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          onClick={() => setSelectedFeature(null)}
        >
          <Card
            variant="elevated"
            padding="xl"
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedFeature === 'generate' && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)]">Generate AI Videos</h2>
                    <p className="text-[var(--text-secondary)]">From text to stunning visuals in seconds</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">What You Can Do:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)]">
                          <strong>Text-to-Video AI:</strong> Simply describe your idea and watch it come to life with cutting-edge AI models (Hailuo, Runway, Luma)
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)]">
                          <strong>Multiple Formats:</strong> Generate videos in 9:16 (TikTok/Reels), 16:9 (YouTube), or 1:1 (Instagram)
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)]">
                          <strong>Professional Quality:</strong> HD exports with customizable styles, themes, and brand watermarks
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)]">
                          <strong>Lightning Fast:</strong> Generate complete videos in under 60 seconds
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Link href="/signup">
                  <Button variant="primary" size="lg" fullWidth>
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Creating Videos
                  </Button>
                </Link>
              </>
            )}

            {selectedFeature === 'schedule' && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)]">Schedule & Auto-Post</h2>
                    <p className="text-[var(--text-secondary)]">Publish everywhere from one dashboard</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">What You Can Do:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)]">
                          <strong>Multi-Platform Support:</strong> Post to Instagram, TikTok, YouTube, Facebook, and LinkedIn simultaneously
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)]">
                          <strong>Smart Scheduling:</strong> AI suggests optimal posting times for maximum engagement
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)]">
                          <strong>Content Calendar:</strong> Visualize your entire posting schedule at a glance
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)]">
                          <strong>Bulk Upload:</strong> Schedule weeks of content in minutes with our bulk upload feature
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Link href="/signup">
                  <Button variant="primary" size="lg" fullWidth>
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Scheduling
                  </Button>
                </Link>
              </>
            )}

            {selectedFeature === 'grow' && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)]">Grow with Analytics</h2>
                    <p className="text-[var(--text-secondary)]">Data-driven insights for explosive growth</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">What You Can Do:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)]">
                          <strong>Real-Time Metrics:</strong> Track engagement, views, likes, shares, and comments across all platforms
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)]">
                          <strong>Follower Growth:</strong> Monitor your audience growth and identify your best-performing content
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)]">
                          <strong>AI Insights:</strong> Get personalized recommendations on what content to create next
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)]">
                          <strong>Competitor Analysis:</strong> See how you stack up against competitors in your niche
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Link href="/signup">
                  <Button variant="primary" size="lg" fullWidth>
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Analyzing
                  </Button>
                </Link>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
