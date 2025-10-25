'use client'

import { useRouter } from 'next/navigation'
import { Home, HelpCircle, Shield, LogOut } from 'lucide-react'

interface FooterMinimalProps {
  showBackButton?: boolean
  backUrl?: string
  backLabel?: string
  onSignOut?: () => void
  appName?: string
}

export default function FooterMinimal({ 
  showBackButton = false, 
  backUrl = '/', 
  backLabel = 'Home',
  onSignOut,
  appName = 'HomeFly Pro™'
}: FooterMinimalProps) {
  const router = useRouter()

  return (
    <footer className="bg-black/40 backdrop-blur-xl border-t border-white/10 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left Side - Navigation */}
          <div className="flex items-center space-x-6">
            {showBackButton && (
              <button
                onClick={() => router.push(backUrl)}
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">{backLabel}</span>
              </button>
            )}
            
            <button className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm">Help</span>
            </button>
            
            <button className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Privacy</span>
            </button>
          </div>

          {/* Center - Copyright */}
          <div className="text-center">
            <div className="text-white/60 text-sm">
              © 2025 {appName}. All rights reserved.
            </div>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/40 text-xs">Secure Connection</span>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-4">
            <div className="text-white/40 text-xs">
              v2.1.0
            </div>
            
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="flex items-center space-x-2 text-white/70 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}