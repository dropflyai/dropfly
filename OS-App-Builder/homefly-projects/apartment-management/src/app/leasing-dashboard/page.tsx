'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  TrendingUp,
  DollarSign,
  Home,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  MessageSquare,
  ChevronLeft,
  Crown,
  Activity,
  Target,
  Award,
  Zap,
  ArrowRight
} from 'lucide-react'

interface LeadData {
  id: string
  name: string
  email: string
  phone: string
  unitType: string
  budget: number
  moveInDate: string
  status: 'new' | 'contacted' | 'toured' | 'applied' | 'approved' | 'declined'
  score: number
  source: string
  lastContact: string
  notes: string
}

interface TourSchedule {
  id: string
  time: string
  prospect: string
  unit: string
  type: 'in-person' | 'virtual'
  status: 'scheduled' | 'completed' | 'no-show'
}

export default function LeasingDashboardPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('leads')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data for leasing agents
  const leadsData: LeadData[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 123-4567',
      unitType: '1 Bedroom',
      budget: 4200,
      moveInDate: '2025-02-15',
      status: 'new',
      score: 85,
      source: 'Website',
      lastContact: '2025-01-20',
      notes: 'Interested in bay view units, flexible on move-in date'
    },
    {
      id: '2', 
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      phone: '(555) 987-6543',
      unitType: '2 Bedroom',
      budget: 5800,
      moveInDate: '2025-03-01',
      status: 'toured',
      score: 92,
      source: 'Referral',
      lastContact: '2025-01-18',
      notes: 'Very interested, excellent credit score, ready to apply'
    },
    {
      id: '3',
      name: 'Lisa Rodriguez',
      email: 'lisa.r@email.com', 
      phone: '(555) 456-7890',
      unitType: 'Studio',
      budget: 3200,
      moveInDate: '2025-01-30',
      status: 'applied',
      score: 78,
      source: 'Zillow',
      lastContact: '2025-01-19',
      notes: 'Application submitted, awaiting background check'
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@email.com',
      phone: '(555) 321-9876',
      unitType: '3 Bedroom',
      budget: 8900,
      moveInDate: '2025-02-20',
      status: 'contacted',
      score: 96,
      source: 'Google Ads',
      lastContact: '2025-01-21',
      notes: 'High-value prospect, interested in penthouse units'
    }
  ]

  const todayTours: TourSchedule[] = [
    {
      id: '1',
      time: '10:00 AM',
      prospect: 'Sarah Johnson',
      unit: '1BR-A5',
      type: 'in-person',
      status: 'scheduled'
    },
    {
      id: '2',
      time: '2:00 PM',
      prospect: 'Mike Chen',
      unit: '2BR-B12',
      type: 'in-person', 
      status: 'scheduled'
    },
    {
      id: '3',
      time: '4:30 PM',
      prospect: 'Jennifer Adams',
      unit: 'Studio-C3',
      type: 'virtual',
      status: 'scheduled'
    }
  ]

  const dailyMetrics = {
    newLeads: 12,
    toursScheduled: 8,
    toursCompleted: 6,
    applicationsReceived: 4,
    leasesCompleted: 2,
    conversionRate: 18.5
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500'
      case 'contacted': return 'bg-yellow-500'
      case 'toured': return 'bg-purple-500'
      case 'applied': return 'bg-orange-500'
      case 'approved': return 'bg-green-500'
      case 'declined': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 80) return 'text-yellow-400'
    if (score >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

  const filteredLeads = leadsData.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || lead.status === filterStatus
    return matchesSearch && matchesFilter
  })

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
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Leasing Dashboard</h1>
                  <p className="text-xs text-gray-400">Agent Tools & Leads</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 rounded-lg text-white text-sm font-medium hover:scale-105 transition-transform">
                <Plus className="w-4 h-4 mr-2 inline" />
                Add Lead
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Daily Metrics */}
      <section className="p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-6 h-6 text-blue-400" />
                <span className="text-xs text-gray-400">Today</span>
              </div>
              <div className="text-xl font-bold text-white">{dailyMetrics.newLeads}</div>
              <div className="text-xs text-gray-400">New Leads</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-6 h-6 text-purple-400" />
                <span className="text-xs text-gray-400">Today</span>
              </div>
              <div className="text-xl font-bold text-white">{dailyMetrics.toursScheduled}</div>
              <div className="text-xs text-gray-400">Tours Scheduled</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Home className="w-6 h-6 text-green-400" />
                <span className="text-xs text-gray-400">Today</span>
              </div>
              <div className="text-xl font-bold text-white">{dailyMetrics.toursCompleted}</div>
              <div className="text-xs text-gray-400">Tours Completed</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-6 h-6 text-orange-400" />
                <span className="text-xs text-gray-400">Today</span>
              </div>
              <div className="text-xl font-bold text-white">{dailyMetrics.applicationsReceived}</div>
              <div className="text-xs text-gray-400">Applications</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-6 h-6 text-cyan-400" />
                <span className="text-xs text-gray-400">Today</span>
              </div>
              <div className="text-xl font-bold text-white">{dailyMetrics.leasesCompleted}</div>
              <div className="text-xs text-gray-400">Leases Signed</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-6 h-6 text-yellow-400" />
                <span className="text-xs text-gray-400">Month</span>
              </div>
              <div className="text-xl font-bold text-white">{dailyMetrics.conversionRate}%</div>
              <div className="text-xs text-gray-400">Conversion Rate</div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-white/10 p-6">
              <div className="flex space-x-4">
                {['leads', 'tours', 'applications'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                      selectedTab === tab
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {selectedTab === 'leads' && (
                <div>
                  {/* Search and Filter */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search leads..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="toured">Toured</option>
                        <option value="applied">Applied</option>
                      </select>
                    </div>
                  </div>

                  {/* Leads Table */}
                  <div className="space-y-4">
                    {filteredLeads.map((lead) => (
                      <div key={lead.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                              {lead.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{lead.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <div className="flex items-center">
                                  <Mail className="w-4 h-4 mr-1" />
                                  {lead.email}
                                </div>
                                <div className="flex items-center">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {lead.phone}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(lead.status)}`}></div>
                            <span className="text-sm text-gray-300 capitalize">{lead.status}</span>
                            <div className={`text-lg font-bold ${getScoreColor(lead.score)}`}>
                              {lead.score}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-gray-400">Unit Type</div>
                            <div className="text-white font-medium">{lead.unitType}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Budget</div>
                            <div className="text-white font-medium">${lead.budget.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Move-in Date</div>
                            <div className="text-white font-medium">{lead.moveInDate}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Source</div>
                            <div className="text-white font-medium">{lead.source}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-300">{lead.notes}</p>
                          <div className="flex space-x-2">
                            <button className="bg-blue-500 hover:bg-blue-600 p-2 rounded-lg text-white transition-colors">
                              <Phone className="w-4 h-4" />
                            </button>
                            <button className="bg-green-500 hover:bg-green-600 p-2 rounded-lg text-white transition-colors">
                              <Mail className="w-4 h-4" />
                            </button>
                            <button className="bg-purple-500 hover:bg-purple-600 p-2 rounded-lg text-white transition-colors">
                              <Calendar className="w-4 h-4" />
                            </button>
                            <button className="bg-orange-500 hover:bg-orange-600 p-2 rounded-lg text-white transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'tours' && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-6">Today's Tours</h3>
                  <div className="space-y-4">
                    {todayTours.map((tour) => (
                      <div key={tour.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">{tour.prospect}</h4>
                            <div className="text-sm text-gray-400">
                              {tour.time} • Unit {tour.unit} • {tour.type}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            tour.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-400' :
                            tour.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {tour.status}
                          </span>
                          <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-lg text-white text-sm font-medium hover:scale-105 transition-transform">
                            Start Tour
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'applications' && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Applications View</h3>
                  <p className="text-gray-400">Application management interface will be built here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}