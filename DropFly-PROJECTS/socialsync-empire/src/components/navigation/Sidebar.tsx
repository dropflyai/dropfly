'use client';

import { Home, Sparkles, Calendar, Folder, Settings, User } from 'lucide-react';
import { NavTab } from './BottomNav';

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
  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-lg
          transition-all duration-200 relative group
          ${isActive
            ? 'bg-gradient-to-r from-[var(--primary-500)]/20 to-[var(--secondary-500)]/20 text-[var(--text-primary)] border-l-2 border-[var(--primary-500)]'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50'
          }
        `}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--primary-500)]' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
        <span className="font-medium">{item.label}</span>
        {item.badge && (
          <span className={`
            ml-auto px-2 py-0.5 text-xs font-semibold rounded-full
            ${isActive
              ? 'bg-[var(--primary-500)]/30 text-[var(--primary-400)]'
              : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)]'
            }
          `}>
            {item.badge}
          </span>
        )}

        {/* Hover indicator */}
        {!isActive && (
          <div className="absolute left-0 w-0.5 h-0 bg-[var(--primary-500)] group-hover:h-full transition-all duration-200 rounded-r-full" />
        )}
      </button>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-[280px] h-screen bg-[var(--bg-secondary)]/50 border-r border-[var(--bg-tertiary)]/50 sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--bg-tertiary)]/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-lg">
            <div className="w-6 h-6 grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-sm"></div>
              ))}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--primary-400)] to-[var(--secondary-500)] bg-clip-text text-transparent">
              SocialSync
            </h1>
            <p className="text-xs text-[var(--text-tertiary)]">AI Content Studio</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {mainNavItems.map(renderNavItem)}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-[var(--bg-tertiary)]/50 space-y-1">
        {bottomNavItems.map(renderNavItem)}

        {/* User Profile */}
        <div className="mt-4 p-3 bg-[var(--bg-tertiary)]/50 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">Rio Allen</p>
            <p className="text-xs text-[var(--text-tertiary)]">{userTier} Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
