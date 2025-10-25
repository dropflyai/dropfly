'use client';

import { Home, Sparkles, Calendar, BookOpen, MoreHorizontal } from 'lucide-react';

export type NavTab = 'home' | 'create' | 'post' | 'library' | 'more';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'create', label: 'Create', icon: Sparkles },
  { id: 'post', label: 'Post', icon: Calendar },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)]/95 backdrop-blur-md border-t border-[var(--bg-tertiary)]/50 z-50 md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                flex flex-col items-center gap-1 p-2 min-w-[60px] rounded-lg
                transition-all duration-200
                ${isActive
                  ? 'text-[var(--primary-500)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] active:scale-95'
                }
              `}
            >
              <div className={`
                relative
                ${isActive ? 'scale-110' : ''}
                transition-transform duration-200
              `}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--primary-500)] rounded-full" />
                )}
              </div>
              <span className={`
                text-xs font-medium
                ${isActive ? 'text-[var(--primary-500)]' : ''}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
