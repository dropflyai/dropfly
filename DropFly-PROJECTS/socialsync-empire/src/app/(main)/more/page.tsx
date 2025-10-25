'use client';

import { Settings, User, CreditCard, HelpCircle, LogOut, Bell, Shield, Palette } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function MorePage() {
  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile & Preferences', description: 'Update your account settings' },
        { icon: Bell, label: 'Notifications', description: 'Manage notification preferences' },
        { icon: Shield, label: 'Privacy & Security', description: 'Control your privacy settings' },
      ],
    },
    {
      title: 'Subscription',
      items: [
        { icon: CreditCard, label: 'Billing & Plans', description: 'Starter - $29/month' },
        { icon: Palette, label: 'Usage & Limits', description: '2/30 videos this month' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Documentation', description: 'Get help and tutorials' },
        { icon: Settings, label: 'App Settings', description: 'Configure app preferences' },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your account and preferences</p>
      </div>

      {/* User Profile Card */}
      <Card variant="glass" padding="lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Rio Allen</h2>
            <p className="text-sm text-[var(--text-secondary)]">rio@example.com</p>
            <span className="inline-block mt-1 text-xs px-2 py-1 bg-[var(--primary-500)]/20 text-[var(--primary-400)] rounded-full">
              Pro Plan
            </span>
          </div>
        </div>
      </Card>

      {/* Settings Groups */}
      {settingsGroups.map((group, i) => (
        <section key={i}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{group.title}</h2>
          <Card padding="none">
            {group.items.map((item, j) => {
              const Icon = item.icon;
              return (
                <button
                  key={j}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-tertiary)] transition-colors text-left border-b border-[var(--bg-tertiary)] last:border-0"
                >
                  <div className="p-2 bg-[var(--bg-tertiary)] rounded-lg">
                    <Icon className="w-5 h-5 text-[var(--text-tertiary)]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--text-primary)]">{item.label}</h4>
                    <p className="text-sm text-[var(--text-tertiary)]">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </Card>
        </section>
      ))}

      {/* Logout */}
      <Card padding="md">
        <button className="w-full flex items-center justify-center gap-2 p-3 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </Card>

      {/* App Info */}
      <div className="text-center text-sm text-[var(--text-tertiary)]">
        <p>SocialSync v1.0.0</p>
        <p className="mt-1">© 2025 SocialSync. All rights reserved.</p>
      </div>
    </div>
  );
}
