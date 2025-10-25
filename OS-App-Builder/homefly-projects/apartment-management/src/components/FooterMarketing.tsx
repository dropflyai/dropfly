'use client'

import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

interface FooterMarketingProps {
  currentPage?: 'home' | 'hoa' | 'apartment'
}

export default function FooterMarketing({ currentPage = 'home' }: FooterMarketingProps) {
  const router = useRouter()

  const brandColors = currentPage === 'hoa' 
    ? 'from-blue-500 via-purple-600 to-blue-700'
    : currentPage === 'apartment'
    ? 'from-yellow-500 via-orange-500 to-yellow-700'
    : 'from-red-500 via-black to-red-700'

  const brandName = currentPage === 'hoa' 
    ? 'Willowbrook HOA'
    : currentPage === 'apartment'
    ? 'Luxury Heights'
    : 'HomeFly Pro™'

  return (
    <footer className="relative z-10 bg-gradient-to-b from-transparent to-black border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-r ${brandColors} rounded-2xl flex items-center justify-center`}>
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
              </div>
              <div>
                <h3 className={`text-xl font-black bg-gradient-to-r ${brandColors} bg-clip-text text-transparent`}>
                  {brandName}
                </h3>
                <p className="text-white/60 text-sm">
                  {currentPage === 'hoa' ? 'community management platform' : 
                   currentPage === 'apartment' ? 'luxury apartment living' : 
                   'social community platform'}
                </p>
              </div>
            </div>
            
            <p className="text-white/70 leading-relaxed">
              {currentPage === 'hoa' ? 
                'Connect with neighbors, participate in community decisions, and stay informed about Willowbrook HOA updates and events.' :
                currentPage === 'apartment' ?
                'Experience luxury living in San Francisco with premium amenities, concierge services, and a vibrant community.' :
                'the social platform your community actually needs. connect with neighbors, manage your HOA, and build real community bonds.'
              }
            </p>
            
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold text-white text-xs ${
                      currentPage === 'hoa' ? 
                        (i === 0 ? 'bg-gradient-to-r from-blue-500 to-purple-600' :
                         i === 1 ? 'bg-gradient-to-r from-purple-600 to-blue-500' :
                         i === 2 ? 'bg-gradient-to-r from-blue-600 to-purple-700' :
                         'bg-gradient-to-r from-purple-500 to-blue-600') :
                      currentPage === 'apartment' ?
                        (i === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                         i === 1 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                         i === 2 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' :
                         'bg-gradient-to-r from-orange-600 to-yellow-600') :
                        (i === 0 ? 'bg-gradient-to-r from-red-500 to-red-700' :
                         i === 1 ? 'bg-gradient-to-r from-black to-red-500' :
                         i === 2 ? 'bg-gradient-to-r from-red-600 to-black' :
                         'bg-gradient-to-r from-white to-red-500')
                    }`}
                  >
                    {['S', 'M', 'J', 'R'][i]}
                  </div>
                ))}
              </div>
              <div className="text-white/60 text-sm">
                <div className="font-semibold">
                  {currentPage === 'hoa' ? '156 residents' :
                   currentPage === 'apartment' ? '247 reviews' :
                   '347+ communities'}
                </div>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white">Platform</h4>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/')}
                className="block text-white/70 hover:text-white transition-colors text-left"
              >
                HomeFly Pro™ Home
              </button>
              <button 
                onClick={() => router.push('/willowbrook')}
                className="block text-white/70 hover:text-white transition-colors text-left"
              >
                HOA Communities
              </button>
              <button 
                onClick={() => router.push('/luxury-heights')}
                className="block text-white/70 hover:text-white transition-colors text-left"
              >
                Apartment Management
              </button>
              <button className="block text-white/70 hover:text-white transition-colors text-left">
                Social Features
              </button>
              <button className="block text-white/70 hover:text-white transition-colors text-left">
                Analytics Dashboard
              </button>
            </div>
          </div>

          {/* Community Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white">Community</h4>
            <div className="space-y-3">
              {currentPage === 'hoa' ? (
                <>
                  <button className="block text-white/70 hover:text-white transition-colors text-left">
                    Board Information
                  </button>
                  <button className="block text-white/70 hover:text-white transition-colors text-left">
                    Community Guidelines
                  </button>
                  <button className="block text-white/70 hover:text-white transition-colors text-left">
                    HOA Documents
                  </button>
                  <button className="block text-white/70 hover:text-white transition-colors text-left">
                    Meeting Minutes
                  </button>
                  <button className="block text-white/70 hover:text-white transition-colors text-left">
                    Contact Board
                  </button>
                </>
              ) : currentPage === 'apartment' ? (
                <>
                  <button className="block text-white/70 hover:text-white transition-colors text-left">
                    Floor Plans
                  </button>
                  <button className="block text-white/70 hover:text-white transition-colors text-left">
                    Amenities
                  </button>
                  <button className="block text-white/70 hover:text-white transition-colors text-left">
                    Virtual Tour
                  </button>
                  <button className="block text-white/70 hover:text-white transition-colors text-left">
                    Leasing Office
                  </button>
                  <button className="block text-white/70 hover:text-white transition-colors text-left">
                    Resident Portal
                  </button>
                </>
              ) : (
                <>
                  <button className="block text-white/70 hover:text-white transition-colors text-left">
                    Help Center
                  </button>
                  <button className="block text-white/70 hover:text-white transition-colors text-left">
                    Community Guidelines
                  </button>
                  <button className="block text-white/70 hover:text-white transition-colors text-left">
                    Blog
                  </button>
                  <button className="block text-white/70 hover:text-white transition-colors text-left">
                    Success Stories
                  </button>
                  <button className="block text-white/70 hover:text-white transition-colors text-left">
                    Contact Us
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Support & Legal */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white">Support</h4>
            <div className="space-y-3">
              <button className="block text-white/70 hover:text-white transition-colors text-left">
                Help Center
              </button>
              <button className="block text-white/70 hover:text-white transition-colors text-left">
                Privacy Policy
              </button>
              <button className="block text-white/70 hover:text-white transition-colors text-left">
                Terms of Service
              </button>
              <button className="block text-white/70 hover:text-white transition-colors text-left">
                Security
              </button>
              <button className="block text-white/70 hover:text-white transition-colors text-left">
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-6 text-white/60 text-sm">
              <span>© 2025 {brandName}. All rights reserved.</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>All systems operational</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Social Media Icons */}
              <div className="flex items-center space-x-4">
                <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-white/70 hover:text-white text-sm font-bold">tw</span>
                </button>
                <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-white/70 hover:text-white text-sm font-bold">ig</span>
                </button>
                <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-white/70 hover:text-white text-sm font-bold">li</span>
                </button>
              </div>
              
              {/* Status Indicators */}
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-white/60">Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="text-white/60">v2.1.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}