'use client';

import { useState } from 'react';
import { Home, Sparkles, Calendar, Folder, Settings, User, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { NavTab } from './BottomNav';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userTier?: string;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'create', label: 'Create', icon: Sparkles, badge: 'AI' },
  { id: 'post', label: 'Post', icon: Calendar },
  { id: 'manage', label: 'Manage', icon: Folder },
];

const bottomNavItems = [
  { id: 'more' as NavTab, label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange, userTier = 'Starter' }: SidebarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        title={collapsed ? item.label : undefined}
        className={`
          w-full flex items-center gap-2.5 rounded-md
          transition-all duration-200 relative group
          ${collapsed ? 'px-2.5 py-2.5 justify-center' : 'px-3 py-2.5'}
          ${isActive
            ? 'bg-gradient-to-r from-[var(--primary-500)]/20 to-[var(--secondary-500)]/20 text-[var(--text-primary)] border-l-2 border-[var(--primary-500)]'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50'
          }
        `}
      >
        <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-[var(--primary-500)]' : ''} ${collapsed ? 'flex-shrink-0' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
        {!collapsed && (
          <>
            <span className="font-medium text-sm">{item.label}</span>
            {item.badge && (
              <span className={`
                ml-auto px-1.5 py-0.5 text-[10px] font-semibold rounded-full
                ${isActive
                  ? 'bg-[var(--primary-500)]/30 text-[var(--primary-400)]'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)]'
                }
              `}>
                {item.badge}
              </span>
            )}
          </>
        )}

        {/* Hover indicator */}
        {!isActive && (
          <div className="absolute left-0 w-0.5 h-0 bg-[var(--primary-500)] group-hover:h-full transition-all duration-200 rounded-r-full" />
        )}
      </button>
    );
  };

  return (
    <aside className={`hidden md:flex flex-col ${collapsed ? 'w-[70px]' : 'w-[240px]'} h-screen bg-[var(--bg-secondary)]/50 border-r border-[var(--bg-tertiary)]/50 sticky top-0 transition-all duration-300 ease-in-out`}>
      {/* Logo and Collapse Button */}
      <div className={`${collapsed ? 'p-3' : 'p-4'} border-b border-[var(--bg-tertiary)]/50 transition-all duration-300`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div className="p-1.5 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-lg flex-shrink-0">
            <div className="w-5 h-5 grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-sm"></div>
              ))}
            </div>
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <h1 className="text-lg font-bold bg-gradient-to-r from-[var(--primary-400)] to-[var(--secondary-500)] bg-clip-text text-transparent whitespace-nowrap">
                SocialSync
              </h1>
              <p className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap">AI Content Studio</p>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full mt-2 p-1.5 hover:bg-[var(--bg-tertiary)]/50 rounded-md transition-colors flex items-center justify-center group"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {mainNavItems.map(renderNavItem)}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-[var(--bg-tertiary)]/50 space-y-0.5">
        {bottomNavItems.map(renderNavItem)}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title={collapsed ? "Log Out" : undefined}
          className={`w-full flex items-center gap-2.5 rounded-md text-[var(--error)] hover:bg-[var(--error)]/10 transition-all duration-200 group ${collapsed ? 'px-2.5 py-2.5 justify-center' : 'px-3 py-2.5'}`}
        >
          <LogOut className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={2} />
          {!collapsed && <span className="font-medium text-sm">Log Out</span>}
        </button>

        {/* User Profile */}
        <div className={`mt-3 bg-[var(--bg-tertiary)]/50 rounded-md flex items-center ${collapsed ? 'p-2 justify-center' : 'p-2.5 gap-2.5'}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">Rio Allen</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">{userTier} Plan</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
