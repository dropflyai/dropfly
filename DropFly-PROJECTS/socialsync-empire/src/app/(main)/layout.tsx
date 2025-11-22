'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import BottomNav, { NavTab } from '@/components/navigation/BottomNav';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatTierName, type TierName } from '@/lib/tiers/tier-config';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userTier, setUserTier] = useState<string>('Free');

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

  // Fetch user's subscription tier
  useEffect(() => {
    async function fetchUserTier() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();

          if (profile?.subscription_tier) {
            const tier = profile.subscription_tier as TierName;
            setUserTier(formatTierName(tier));
          }
        }
      } catch (error) {
        console.error('Error fetching user tier:', error);
      }
    }

    fetchUserTier();
  }, []);

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
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} userTier={userTier} />

      {/* Main Content */}
      <div className="flex-1 pb-20 md:pb-0">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
