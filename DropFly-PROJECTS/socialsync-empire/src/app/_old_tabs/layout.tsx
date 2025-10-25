'use client';

import { useState } from 'react';
import { BottomNav, Sidebar, MobileHeader, type NavTab } from '@/components/navigation';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  const tabTitles: Record<NavTab, string> = {
    home: 'SocialSync',
    create: 'Create',
    tools: 'Tools',
    library: 'Library',
    analytics: 'Analytics',
    more: 'Settings',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Mobile Header */}
      <MobileHeader title={tabTitles[activeTab]} />

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
