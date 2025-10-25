'use client';

import { Menu, Bell, Search } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
}

export default function MobileHeader({
  title,
  showSearch = false,
  showNotifications = true,
  onMenuClick,
  onSearchClick,
  onNotificationsClick,
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-800/50 md:hidden safe-area-inset-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <div className="w-6 h-6 grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-sm"></div>
              ))}
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <button
              onClick={onSearchClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5 text-gray-300" />
            </button>
          )}

          {showNotifications && (
            <button
              onClick={onNotificationsClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-300" />
              {/* Notification badge */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
