'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  Calendar,
  MapPin,
  Crown,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Home,
  ChevronLeft,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'

export default function CorporateDashboardPage() {
  const router = useRouter()
  const [selectedProperty, setSelectedProperty] = useState('all')
  const [timeRange, setTimeRange] = useState('30d')

  // Executive KPI Data
  const kpiData = {
    totalRevenue: 2847500,
    occupancyRate: 94.2,
    totalUnits: 1247,
    avgRentPerSqft: 3.85,
    noi: 1892300,
    capRate: 5.8
  }

  const portfolioProperties = [
    {
      id: 'luxury-heights',
      name: 'Luxury Heights',
      location: 'San Francisco, CA',
      units: 247,
      occupancy: 96.8,
      avgRent: 4200,
      revenue: 1038400,
      noi: 692600
    },
    {
      id: 'metro-towers',
      name: 'Metro Towers',
      location: 'Oakland, CA', 
      units: 450,
      occupancy: 92.4,
      avgRent: 3100,
      revenue: 1395000,
      noi: 930000
    },
    {
      id: 'riverside-commons',
      name: 'Riverside Commons',
      location: 'San Jose, CA',
      units: 320,
      occupancy: 95.0,
      avgRent: 3850,
      revenue: 1232000,
      noi: 822400
    },
    {
      id: 'downtown-lofts',
      name: 'Downtown Lofts',
      location: 'Berkeley, CA',
      units: 230,
      occupancy: 91.7,
      avgRent: 2950,
      revenue: 678250,
      noi: 452400
    }
  ]

  const marketMetrics = [
    { metric: 'Portfolio Occupancy', value: '94.2%', change: '+2.1%', trend: 'up' },
    { metric: 'Avg Days to Lease', value: '12.4', change: '-3.2', trend: 'up' },
    { metric: 'Resident Satisfaction', value: '4.7/5', change: '+0.3', trend: 'up' },
    { metric: 'Operating Expenses', value: '$1.42/sf', change: '-$0.08', trend: 'up' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/50 to-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
              
              <div className="h-8 w-px bg-white/20" />
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Corporate Dashboard</h1>
                  <p className="text-xs text-gray-400">Executive Overview</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last Quarter</option>
                <option value="12m">Last Year</option>
              </select>
              
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 rounded-lg text-white text-sm font-medium hover:scale-105 transition-transform">
                <Download className="w-4 h-4 mr-2 inline" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-400" />
                <ArrowUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                ${(kpiData.totalRevenue / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm text-gray-400">Total Revenue</div>
              <div className="text-xs text-green-400 mt-1">+8.2% vs last period</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Home className="w-8 h-8 text-blue-400" />
                <ArrowUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{kpiData.occupancyRate}%</div>
              <div className="text-sm text-gray-400">Occupancy Rate</div>
              <div className="text-xs text-green-400 mt-1">+2.1% vs last period</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-8 h-8 text-purple-400" />
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{kpiData.totalUnits.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Units</div>
              <div className="text-xs text-gray-400 mt-1">Across 4 properties</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-orange-400" />
                <ArrowUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">${kpiData.avgRentPerSqft}</div>
              <div className="text-sm text-gray-400">Avg Rent/SqFt</div>
              <div className="text-xs text-green-400 mt-1">+5.7% vs last period</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 text-cyan-400" />
                <ArrowUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                ${(kpiData.noi / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm text-gray-400">Net Operating Income</div>
              <div className="text-xs text-green-400 mt-1">+12.4% vs last period</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <PieChart className="w-8 h-8 text-yellow-400" />
                <ArrowUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{kpiData.capRate}%</div>
              <div className="text-sm text-gray-400">Cap Rate</div>
              <div className="text-xs text-green-400 mt-1">+0.3% vs last period</div>
            </div>
          </div>

          {/* Portfolio Properties */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Portfolio Properties</h2>
                <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {portfolioProperties.map((property) => (
                  <div key={property.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{property.name}</h3>
                        <div className="flex items-center text-sm text-gray-400">
                          <MapPin className="w-4 h-4 mr-1" />
                          {property.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-cyan-400">
                          {property.occupancy}%
                        </div>
                        <div className="text-xs text-gray-400">Occupied</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Units</div>
                        <div className="text-white font-medium">{property.units}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Avg Rent</div>
                        <div className="text-white font-medium">${property.avgRent.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Revenue</div>
                        <div className="text-white font-medium">${(property.revenue / 1000).toFixed(0)}K</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Performance Metrics */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-8">Market Performance</h2>
              
              <div className="space-y-6">
                {marketMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{metric.metric}</div>
                      <div className="text-2xl font-bold text-white mt-1">{metric.value}</div>
                    </div>
                    <div className={`flex items-center space-x-2 ${
                      metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {metric.trend === 'up' ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                      <span className="font-medium">{metric.change}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl text-white text-sm font-medium hover:scale-105 transition-transform">
                    View Detailed Report
                  </button>
                  <button className="bg-white/10 border border-white/20 p-3 rounded-xl text-white text-sm font-medium hover:bg-white/20 transition-colors">
                    Schedule Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}