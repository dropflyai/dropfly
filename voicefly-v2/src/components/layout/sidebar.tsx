"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Users,
  Search,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Maya AI", href: "/dashboard/maya", icon: Bot },
  { label: "Leads", href: "/dashboard/leads", icon: Users },
  { label: "Research", href: "/dashboard/research", icon: Search },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-[var(--color-border-default)] bg-[var(--color-bg-surface)] transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--color-border-default)] px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-purple)]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
              VoiceFly
            </span>
          )}
        </Link>
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-[var(--color-bg-hover)]",
                isActive
                  ? "bg-[var(--color-accent-purple-subtle)] text-[var(--color-accent-purple)]"
                  : "text-[var(--color-text-secondary)]",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border-default)] p-4">
        {!collapsed && (
          <p className="text-xs text-[var(--color-text-tertiary)]">VoiceFly v2.0</p>
        )}
      </div>
    </aside>
  );
}

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-60 p-0">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-[var(--color-border-default)] px-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2"
              onClick={() => onOpenChange(false)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-purple)]">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
                VoiceFly
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-[var(--color-bg-hover)]",
                    isActive
                      ? "bg-[var(--color-accent-purple-subtle)] text-[var(--color-accent-purple)]"
                      : "text-[var(--color-text-secondary)]"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-[var(--color-border-default)] p-4">
            <p className="text-xs text-[var(--color-text-tertiary)]">VoiceFly v2.0</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MobileSidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={onClick}
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
