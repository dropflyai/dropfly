'use client';

import { useState } from 'react';
import { Sparkles, Heart, Trash2, Check, Mail, Lock, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import BottomSheet from '@/components/ui/BottomSheet';
import BottomNav, { NavTab } from '@/components/navigation/BottomNav';
import Sidebar from '@/components/navigation/Sidebar';

export default function DesignSystemDemo() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} userTier="Pro" />

      {/* Main Content */}
      <div className="flex-1 pb-20 md:pb-0">
        {/* Header */}
        <header className="bg-[var(--bg-secondary)]/50 border-b border-[var(--bg-tertiary)]/50 p-6 md:hidden">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Design System Demo</h1>
          <p className="text-sm text-[var(--text-tertiary)]">Showcasing all components</p>
        </header>

        {/* Content Area */}
        <div className="max-w-6xl mx-auto p-6 space-y-12">

          {/* Hero Section */}
          <section className="text-center py-12">
            <div className="inline-block p-3 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-2xl mb-4">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              SocialSync Design System
            </h1>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Research-backed, professional UI components built with dark mode,
              inspired by DaVinci Resolve, Final Cut Pro X, and modern AI tools.
            </p>
          </section>

          {/* Color Palette */}
          <section>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Color Palette</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card padding="md">
                <div className="w-full h-20 bg-[var(--primary-500)] rounded-lg mb-3"></div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Primary</p>
                <p className="text-xs text-[var(--text-tertiary)]">#8b5cf6</p>
              </Card>

              <Card padding="md">
                <div className="w-full h-20 bg-[var(--secondary-500)] rounded-lg mb-3"></div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Secondary</p>
                <p className="text-xs text-[var(--text-tertiary)]">#3b82f6</p>
              </Card>

              <Card padding="md">
                <div className="w-full h-20 bg-[var(--accent-500)] rounded-lg mb-3"></div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Accent</p>
                <p className="text-xs text-[var(--text-tertiary)]">#ec4899</p>
              </Card>

              <Card padding="md">
                <div className="w-full h-20 bg-[var(--success)] rounded-lg mb-3"></div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Success</p>
                <p className="text-xs text-[var(--text-tertiary)]">#10b981</p>
              </Card>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Card padding="sm">
                <div className="w-full h-16 bg-[var(--bg-primary)] rounded mb-2"></div>
                <p className="text-xs text-[var(--text-tertiary)]">BG Primary</p>
              </Card>
              <Card padding="sm">
                <div className="w-full h-16 bg-[var(--bg-secondary)] rounded mb-2"></div>
                <p className="text-xs text-[var(--text-tertiary)]">BG Secondary</p>
              </Card>
              <Card padding="sm">
                <div className="w-full h-16 bg-[var(--bg-tertiary)] rounded mb-2"></div>
                <p className="text-xs text-[var(--text-tertiary)]">BG Tertiary</p>
              </Card>
              <Card padding="sm">
                <div className="w-full h-16 bg-[var(--bg-elevated)] rounded mb-2"></div>
                <p className="text-xs text-[var(--text-tertiary)]">BG Elevated</p>
              </Card>
            </div>
          </section>

          {/* Typography */}
          <section>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Typography</h2>
            <Card padding="lg">
              <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Heading 1 - 36px</h1>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Heading 2 - 30px</h2>
              <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Heading 3 - 24px</h3>
              <h4 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Heading 4 - 20px</h4>
              <p className="text-base text-[var(--text-secondary)] mb-2">Body text - 16px (base)</p>
              <p className="text-sm text-[var(--text-tertiary)] mb-2">Small text - 14px</p>
              <p className="text-xs text-[var(--text-tertiary)]">Extra small - 12px</p>
            </Card>
          </section>

          {/* Buttons */}
          <section>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Buttons</h2>

            <Card padding="lg" className="space-y-6">
              {/* Variants */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="danger">Danger Button</Button>
                  <Button variant="success">Success Button</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </div>

              {/* With Icons */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">With Icons</h3>
                <div className="flex flex-wrap gap-3">
                  <Button icon={<Sparkles className="w-4 h-4" />}>AI Generate</Button>
                  <Button variant="secondary" icon={<Heart className="w-4 h-4" />} iconPosition="right">
                    Like
                  </Button>
                  <Button variant="danger" icon={<Trash2 className="w-4 h-4" />}>Delete</Button>
                  <Button variant="success" icon={<Check className="w-4 h-4" />}>Confirm</Button>
                </div>
              </div>

              {/* States */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">States</h3>
                <div className="flex flex-wrap gap-3">
                  <Button loading>Loading...</Button>
                  <Button disabled>Disabled</Button>
                  <Button fullWidth>Full Width Button</Button>
                </div>
              </div>
            </Card>
          </section>

          {/* Cards */}
          <section>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Cards</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="default" padding="lg">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Default Card</h3>
                <p className="text-[var(--text-secondary)]">
                  Standard card with solid background. Great for content containers.
                </p>
              </Card>

              <Card variant="glass" padding="lg">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Glass Card</h3>
                <p className="text-[var(--text-secondary)]">
                  Frosted glass effect with backdrop blur. Modern and elegant.
                </p>
              </Card>

              <Card variant="elevated" padding="lg">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Elevated Card</h3>
                <p className="text-[var(--text-secondary)]">
                  Card with shadow elevation. Perfect for important content.
                </p>
              </Card>

              <Card variant="bordered" padding="lg">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Bordered Card</h3>
                <p className="text-[var(--text-secondary)]">
                  Transparent with border. Subtle and minimal style.
                </p>
              </Card>

              <Card variant="default" padding="lg" clickable hover>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Clickable Card</h3>
                <p className="text-[var(--text-secondary)]">
                  Interactive card with hover effects. Click me!
                </p>
              </Card>

              <Card variant="glass" padding="lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-full"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">User Card</h3>
                    <p className="text-sm text-[var(--text-tertiary)]">Example with avatar</p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Inputs */}
          <section>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Inputs</h2>

            <Card padding="lg" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail className="w-4 h-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  icon={<Lock className="w-4 h-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Input
                  label="Search"
                  placeholder="Search content..."
                  icon={<Search className="w-4 h-4" />}
                  iconPosition="right"
                  helperText="Try searching for AI, video, or tools"
                />

                <Input
                  label="With Error"
                  placeholder="username"
                  error="Username is already taken"
                />

                <Input
                  label="Disabled Input"
                  placeholder="Can't edit this"
                  disabled
                />

                <Input
                  label="Text Area"
                  multiline
                  rows={4}
                  placeholder="Enter your message..."
                />
              </div>
            </Card>
          </section>

          {/* Bottom Sheet Demo */}
          <section>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Bottom Sheet (Mobile Modal)</h2>

            <Card padding="lg">
              <p className="text-[var(--text-secondary)] mb-4">
                Mobile-optimized modal that slides up from the bottom. Try it on mobile or resize your browser!
              </p>
              <Button onClick={() => setShowBottomSheet(true)}>Open Bottom Sheet</Button>
            </Card>

            <BottomSheet
              isOpen={showBottomSheet}
              onClose={() => setShowBottomSheet(false)}
              title="Example Bottom Sheet"
            >
              <div className="space-y-4">
                <p className="text-[var(--text-secondary)]">
                  This is a mobile-optimized modal that slides up from the bottom of the screen.
                </p>
                <p className="text-[var(--text-tertiary)] text-sm">
                  You can drag it down to dismiss, or click the X button.
                </p>

                <div className="pt-4 border-t border-[var(--bg-tertiary)]">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button fullWidth variant="primary">Primary Action</Button>
                    <Button fullWidth variant="secondary">Secondary Action</Button>
                    <Button fullWidth variant="ghost" onClick={() => setShowBottomSheet(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </BottomSheet>
          </section>

          {/* Animations */}
          <section>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Animations</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card padding="lg" className="animate-fadeIn">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Fade In</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Smooth opacity transition
                </p>
              </Card>

              <Card padding="lg" className="animate-slideInUp">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Slide Up</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Slides from below
                </p>
              </Card>

              <Card padding="lg" className="animate-fadeScaleIn">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Scale In</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Fades and scales
                </p>
              </Card>
            </div>
          </section>

          {/* Navigation Info */}
          <section>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Navigation</h2>

            <Card padding="lg">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Current Tab: <span className="text-[var(--primary-500)]">{activeTab}</span>
              </h3>
              <p className="text-[var(--text-secondary)] mb-4">
                Navigation adapts based on screen size:
              </p>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--primary-500)] rounded-full"></div>
                  <strong>Desktop (≥768px):</strong> Fixed left sidebar with logo and user profile
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--secondary-500)] rounded-full"></div>
                  <strong>Mobile (&lt;768px):</strong> Bottom navigation bar with 5 tabs
                </li>
              </ul>
              <p className="text-sm text-[var(--text-tertiary)] mt-4">
                Try resizing your browser to see the navigation transform!
              </p>
            </Card>
          </section>

        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
