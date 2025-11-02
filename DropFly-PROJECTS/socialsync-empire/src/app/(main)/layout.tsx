'use client';

import { useState } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import BottomNav, { NavTab } from '@/components/navigation/BottomNav';
import { useRouter, usePathname } from 'next/navigation';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active tab from pathname
  const getActiveTab = (): NavTab => {
    if (pathname.includes('/create')) return 'create';
    if (pathname.includes('/post')) return 'post';
    if (pathname.includes('/manage')) return 'manage';
    if (pathname.includes('/library')) return 'library';
    if (pathname.includes('/more')) return 'more';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState<NavTab>(getActiveTab());

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);

    // Navigate to the appropriate route
    const routes: Record<NavTab, string> = {
      home: '/home',
      create: '/create',
      post: '/post',
      manage: '/manage',
      library: '/library',
      more: '/more',
    };

    router.push(routes[tab]);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} userTier="Pro" />

      {/* Main Content */}
      <div className="flex-1 pb-20 md:pb-0">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
