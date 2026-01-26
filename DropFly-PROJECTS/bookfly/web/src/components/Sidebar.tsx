/**
 * Sidebar Navigation Component
 *
 * Main navigation sidebar with links, client picker, and user menu.
 * Collapses to icons on mobile.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { cn, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  ClipboardCheck,
  History,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

// Navigation items
const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Review',
    href: '/review',
    icon: ClipboardCheck,
  },
  {
    label: 'History',
    href: '/history',
    icon: History,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

// Mock clients for client picker
const mockClients = [
  { id: '1', name: 'Acme Corporation' },
  { id: '2', name: 'Tech Startup Inc' },
  { id: '3', name: 'Local Business LLC' },
];

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clientMenuOpen, setClientMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const supabase = createBrowserSupabaseClient();

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      router.push('/auth');
      router.refresh();
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  // Get user display info
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';
  const userInitials = getInitials(userName);

  // Check if a nav item is active
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden"
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6 text-neutral-600" />
        ) : (
          <Menu className="h-6 w-6 text-neutral-600" />
        )}
      </button>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform lg:static lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-neutral-100 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-neutral-900">BookFly</span>
        </div>

        {/* Client picker */}
        <div className="border-b border-neutral-100 p-4">
          <div className="relative">
            <button
              onClick={() => setClientMenuOpen(!clientMenuOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-left transition-colors hover:bg-neutral-100"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                  <Building2 className="h-4 w-4 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {selectedClient
                      ? mockClients.find((c) => c.id === selectedClient)?.name
                      : 'All Clients'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {selectedClient ? 'Selected client' : 'Viewing all'}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-neutral-400 transition-transform',
                  clientMenuOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Client dropdown */}
            {clientMenuOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-neutral-200 bg-white py-1 shadow-dropdown">
                <button
                  onClick={() => {
                    setSelectedClient(null);
                    setClientMenuOpen(false);
                    router.push('/dashboard');
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50',
                    !selectedClient && 'bg-primary-50 text-primary-700'
                  )}
                >
                  <Building2 className="h-4 w-4" />
                  All Clients
                </button>
                <div className="my-1 border-t border-neutral-100" />
                {mockClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client.id);
                      setClientMenuOpen(false);
                      router.push(`/review/${client.id}`);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50',
                      selectedClient === client.id && 'bg-primary-50 text-primary-700'
                    )}
                  >
                    <Building2 className="h-4 w-4" />
                    {client.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  active ? 'nav-link-active' : 'nav-link'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User menu */}
        <div className="border-t border-neutral-100 p-4">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {userName}
                </p>
                <p className="truncate text-xs text-neutral-500">{userEmail}</p>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-neutral-400 transition-transform',
                  userMenuOpen && 'rotate-180'
                )}
              />
            </button>

            {/* User dropdown */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 z-10 mb-1 rounded-lg border border-neutral-200 bg-white py-1 shadow-dropdown">
                <Link
                  href="/settings"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setMobileMenuOpen(false);
                  }}
                  className="dropdown-item"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <div className="my-1 border-t border-neutral-100" />
                <button
                  onClick={handleSignOut}
                  className="dropdown-item text-error-600 hover:bg-error-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
