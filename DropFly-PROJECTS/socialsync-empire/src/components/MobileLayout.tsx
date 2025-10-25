'use client';

import { useState, useEffect } from 'react';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Home,
  Settings,
  HelpCircle,
  Download,
  Share,
  Heart,
  Star
} from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBottomNav?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  headerActions?: React.ReactNode;
}

export default function MobileLayout({
  children,
  title = "SocialSync",
  showBottomNav = true,
  showBackButton = false,
  onBack,
  headerActions
}: MobileLayoutProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left Side */}
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors md:hidden"
              >
                <ChevronLeft className="w-5 h-5 text-gray-300" />
              </button>
            ) : (
              <button
                onClick={() => setShowMobileMenu(true)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors md:hidden"
              >
                <Menu className="w-5 h-5 text-gray-300" />
              </button>
            )}

            <div className="flex items-center gap-2">
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
                <p className="text-xs text-gray-400 hidden sm:block">Professional Video Suite</p>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {headerActions}
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-gray-900 z-50 transform transition-transform duration-300 md:hidden">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors text-left">
                <Home className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">Home</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors text-left">
                <Download className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">My Downloads</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors text-left">
                <Heart className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">Favorites</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors text-left">
                <Star className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">Pro Features</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors text-left">
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors text-left">
                <HelpCircle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">Help & Support</span>
              </button>
            </div>

            {/* Menu Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className={`${showBottomNav ? 'pb-20' : 'pb-4'} px-4 md:px-6`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800/50 md:hidden">
          <div className="flex items-center justify-around py-2">
            <button className="flex flex-col items-center gap-1 p-2">
              <Home className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-blue-400">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2">
              <Download className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400">Downloads</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2">
              <Heart className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400">Favorites</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2">
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400">Settings</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

// Mobile-optimized card component
export function MobileCard({
  children,
  className = "",
  padding = "p-4",
  clickable = false,
  onClick
}: {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  clickable?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`
        bg-gray-800/50 rounded-xl border border-gray-700/50 backdrop-blur-sm
        ${clickable ? 'active:scale-[0.98] transition-transform cursor-pointer' : ''}
        ${padding}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Mobile-optimized button component
export function MobileButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  className = ""
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const baseClasses = "font-medium rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white",
    ghost: "bg-transparent hover:bg-gray-800 text-gray-300",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// Mobile-optimized slider component
export function MobileSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = true
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        {showValue && (
          <span className="text-sm text-gray-400">{value}</span>
        )}
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-6 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #374151 ${((value - min) / (max - min)) * 100}%, #374151 100%)`
          }}
        />
      </div>
    </div>
  );
}

// Mobile-optimized input component
export function MobileInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline = false,
  rows = 3
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const inputClasses = "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-300">{label}</label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}
    </div>
  );
}