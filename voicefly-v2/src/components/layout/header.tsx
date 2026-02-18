"use client";

import { useState } from "react";
import Link from "next/link";
import { Sun, Moon, Bell, Search, Menu, User, LogOut, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from "@/components/ui/dropdown";
import { CreditMeter } from "@/components/domain/credit-meter";

interface HeaderProps {
  onMenuClick?: () => void;
  onCommandPaletteOpen?: () => void;
}

export function Header({ onMenuClick, onCommandPaletteOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [notificationCount] = useState(3);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 md:px-6">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Command palette trigger */}
        <Button
          variant="ghost"
          className="hidden w-64 justify-start gap-2 text-[var(--color-text-secondary)] sm:flex"
          onClick={onCommandPaletteOpen}
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-1.5 font-mono text-xs font-medium text-[var(--color-text-tertiary)] sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        {/* Mobile search button */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={onCommandPaletteOpen}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Credit Meter */}
        <CreditMeter credits={2500} maxCredits={5000} className="hidden sm:flex" />

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-error)] text-xs font-medium text-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Button>

        {/* User dropdown */}
        <Dropdown>
          <DropdownTrigger className="relative h-8 w-8 rounded-full">
            <Avatar src="/avatars/user.png" name="John Doe" size="sm" />
          </DropdownTrigger>
          <DropdownContent className="w-56" align="end">
            <DropdownLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-[var(--color-text-primary)]">
                  John Doe
                </p>
                <p className="text-xs leading-none text-[var(--color-text-tertiary)]">
                  john@example.com
                </p>
              </div>
            </DropdownLabel>
            <DropdownSeparator />
            <DropdownItem icon={<User className="h-4 w-4" />}>
              Profile
            </DropdownItem>
            <Link href="/dashboard/settings">
              <DropdownItem icon={<Settings className="h-4 w-4" />}>
                Settings
              </DropdownItem>
            </Link>
            <DropdownSeparator />
            <DropdownItem
              icon={<LogOut className="h-4 w-4" />}
              destructive
            >
              Log out
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </header>
  );
}

export default Header;
