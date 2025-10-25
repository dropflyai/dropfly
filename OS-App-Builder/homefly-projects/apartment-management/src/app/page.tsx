'use client'

import { Building2, Users, Home, Crown, Star, Eye, FileText } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/50 to-black">
      {/* Hero Section */}
      <section className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Crown className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6">
            Luxury Heights Apartments
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Premium apartment management system with advanced leasing tools and resident services
          </p>

          {/* Dashboard Access Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Corporate Dashboard */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Corporate Dashboard</h3>
              <p className="text-gray-400 mb-6">Executive overview with portfolio metrics, financial reporting, and market analysis</p>
              <a 
                href="/corporate-dashboard"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transition-transform inline-block"
              >
                Access Dashboard
              </a>
            </div>

            {/* Leasing Dashboard */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Leasing Dashboard</h3>
              <p className="text-gray-400 mb-6">Lead management, tour scheduling, and application processing for leasing agents</p>
              <a 
                href="/leasing-dashboard"
                className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transition-transform inline-block"
              >
                Access Dashboard
              </a>
            </div>

            {/* Resident Dashboard */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Resident Portal</h3>
              <p className="text-gray-400 mb-6">Rent payments, maintenance requests, and community amenities for residents</p>
              <a 
                href="/resident-dashboard"
                className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transition-transform inline-block"
              >
                Access Portal
              </a>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <a 
              href="/units" 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-4 rounded-xl text-white font-medium hover:scale-105 transition-transform flex items-center"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Available Units
            </a>
            <a 
              href="/virtual-tour" 
              className="bg-white/10 border border-white/20 px-8 py-4 rounded-xl text-white hover:bg-white/20 transition-colors flex items-center"
            >
              <Eye className="w-5 h-5 mr-2" />
              Take Virtual Tour
            </a>
            <a 
              href="/apartment-dashboard" 
              className="bg-white/10 border border-white/20 px-8 py-4 rounded-xl text-white hover:bg-white/20 transition-colors flex items-center"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Property Management
            </a>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Premium Experience</h4>
              <p className="text-gray-400">Luxury amenities and world-class service</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Smart Management</h4>
              <p className="text-gray-400">AI-powered leasing and resident services</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Community First</h4>
              <p className="text-gray-400">Building connections and exceptional living</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}