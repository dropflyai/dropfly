'use client';

import { useState } from 'react';
import { User, Palette, Link2, CreditCard, Building2, HelpCircle, LogOut, ChevronRight, Bell, Shield } from 'lucide-react';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import BottomSheet from '@/components/ui/BottomSheet';
import AvatarManager from '@/components/features/AvatarManager';

export default function MorePage() {
  const [showAvatarManager, setShowAvatarManager] = useState(false);

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile Settings',
          subtitle: 'Edit your personal information',
          action: () => console.log('Profile'),
        },
        {
          icon: Palette,
          label: 'AI Avatars',
          subtitle: 'Manage your AI personas',
          badge: 'New',
          action: () => setShowAvatarManager(true),
        },
        {
          icon: Bell,
          label: 'Notifications',
          subtitle: 'Push notifications & alerts',
          action: () => console.log('Notifications'),
        },
      ],
    },
    {
      title: 'Brand & Content',
      items: [
        {
          icon: Palette,
          label: 'Brand Voice',
          subtitle: 'Configure AI personality',
          action: () => console.log('Brand Voice'),
        },
        {
          icon: Link2,
          label: 'Connected Platforms',
          subtitle: 'Manage social accounts',
          badge: '3 connected',
          action: () => console.log('Platforms'),
        },
      ],
    },
    {
      title: 'Billing & Enterprise',
      items: [
        {
          icon: CreditCard,
          label: 'Billing & Usage',
          subtitle: 'Plan: Pro • 12/50 videos used',
          action: () => console.log('Billing'),
        },
        {
          icon: Building2,
          label: 'White Label',
          subtitle: 'Agency & enterprise features',
          badge: 'Pro',
          action: () => console.log('White Label'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Support',
          subtitle: 'Docs, tutorials, contact us',
          action: () => console.log('Help'),
        },
        {
          icon: Shield,
          label: 'Privacy & Security',
          subtitle: 'Data, permissions, settings',
          action: () => console.log('Privacy'),
        },
      ],
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      {/* User Profile Card */}
      <Card variant="glass" padding="lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white">Rio Allen</h3>
            <p className="text-sm text-gray-400">rio@example.com</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="primary" size="sm">Pro Plan</Badge>
              <Badge variant="success" size="sm">370% Margin</Badge>
            </div>
          </div>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors">
            Edit
          </button>
        </div>
      </Card>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {section.title}
          </h3>
          <Card variant="glass" padding="none">
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              return (
                <button
                  key={itemIndex}
                  onClick={item.action}
                  className={`
                    w-full flex items-center gap-4 p-4 text-left
                    hover:bg-gray-800/50 transition-colors
                    ${itemIndex !== section.items.length - 1 ? 'border-b border-gray-800/50' : ''}
                  `}
                >
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white">{item.label}</p>
                      {item.badge && (
                        <Badge variant="primary" size="sm">{item.badge}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{item.subtitle}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
                </button>
              );
            })}
          </Card>
        </div>
      ))}

      {/* Logout */}
      <Button
        variant="danger"
        fullWidth
        icon={<LogOut className="w-5 h-5" />}
        onClick={() => console.log('Logout')}
      >
        Log Out
      </Button>

      {/* Avatar Manager Bottom Sheet */}
      <BottomSheet
        isOpen={showAvatarManager}
        onClose={() => setShowAvatarManager(false)}
        title="AI Avatars"
      >
        <div className="space-y-4">
          <p className="text-gray-400">
            Upload photos to create AI avatars that appear in your videos.
            Perfect for brand consistency and personal branding.
          </p>
          <AvatarManager />
        </div>
      </BottomSheet>
    </div>
  );
}
