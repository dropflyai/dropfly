'use client'

import React from 'react'
import { 
  Home, 
  Users, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Activity, 
  Bell,
  CheckCircle,
  AlertTriangle,
  Crown,
  Building,
  BarChart3,
  PieChart,
  Vote,
  FileText,
  Shield
} from 'lucide-react'

interface OverviewContentProps {
  communityType: 'apartment' | 'hoa'
}

const OverviewContent: React.FC<OverviewContentProps> = ({ communityType }) => {
  const hoaStats = [
    { label: 'Total Units', value: '180', icon: Home, color: 'text-blue-400' },
    { label: 'Active Residents', value: '167', icon: Users, color: 'text-green-400' },
    { label: 'Monthly Dues Collected', value: '92%', icon: DollarSign, color: 'text-yellow-400' },
    { label: 'Active Polls', value: '2', icon: Vote, color: 'text-purple-400' },
    { label: 'Pending ARC Requests', value: '4', icon: Building, color: 'text-orange-400' },
    { label: 'Board Members', value: '5', icon: Crown, color: 'text-pink-400' }
  ]

  const apartmentStats = [
    { label: 'Total Units', value: '48', icon: Home, color: 'text-blue-400' },
    { label: 'Occupied Units', value: '45', icon: Users, color: 'text-green-400' },
    { label: 'Occupancy Rate', value: '94%', icon: TrendingUp, color: 'text-green-400' },
    { label: 'Pending Applications', value: '12', icon: FileText, color: 'text-yellow-400' },
    { label: 'Active Leases', value: '43', icon: Shield, color: 'text-purple-400' },
    { label: 'Monthly Revenue', value: '$78K', icon: DollarSign, color: 'text-green-400' }
  ]

  const hoaRecentActivity = [
    { type: 'poll', title: 'Pool Renovation Project Approval', description: 'New vote submitted by Sarah Johnson', time: '2 hours ago', icon: Vote },
    { type: 'payment', title: 'Monthly Dues Payment', description: '15 residents paid their HOA dues', time: '4 hours ago', icon: DollarSign },
    { type: 'arc', title: 'Architectural Review Request', description: 'New deck installation request submitted', time: '6 hours ago', icon: Building },
    { type: 'board', title: 'Board Meeting Scheduled', description: 'February meeting scheduled for 2/15', time: '1 day ago', icon: Crown },
    { type: 'alert', title: 'Maintenance Alert', description: 'Pool heater requiring inspection', time: '2 days ago', icon: AlertTriangle }
  ]

  const apartmentRecentActivity = [
    { type: 'application', title: 'New Application Received', description: 'Unit 2B - Sarah Thompson', time: '1 hour ago', icon: FileText },
    { type: 'lease', title: 'Lease Signed', description: 'Unit 4A - Michael Chen', time: '3 hours ago', icon: Shield },
    { type: 'payment', title: 'Rent Payment Received', description: 'Unit 1C - $2,400', time: '5 hours ago', icon: DollarSign },
    { type: 'maintenance', title: 'Maintenance Request', description: 'Unit 3B - HVAC repair needed', time: '8 hours ago', icon: AlertTriangle },
    { type: 'inquiry', title: 'Leasing Inquiry', description: 'Phone inquiry for 1-bedroom unit', time: '1 day ago', icon: Users }
  ]

  const stats = communityType === 'hoa' ? hoaStats : apartmentStats
  const recentActivity = communityType === 'hoa' ? hoaRecentActivity : apartmentRecentActivity

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          {communityType === 'hoa' ? 'HOA Overview' : 'Leasing Overview'}
        </h1>
        <p className="text-white/60 mt-2">
          {communityType === 'hoa' 
            ? 'Community governance and management dashboard'
            : 'Property management and leasing analytics'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className={`w-4 h-4 ${stat.color}`} />
              <span className="text-sm text-gray-400">
                {communityType === 'hoa' ? 'Community Health' : 'Performance'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {communityType === 'hoa' ? (
            <>
              <button className="flex items-center space-x-3 p-4 bg-blue-500/20 border border-blue-500/30 rounded-2xl text-blue-400 hover:bg-blue-500/30 transition-colors">
                <Vote className="w-5 h-5" />
                <span>Create Poll</span>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-400 hover:bg-green-500/30 transition-colors">
                <DollarSign className="w-5 h-5" />
                <span>Collect Dues</span>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-400 hover:bg-purple-500/30 transition-colors">
                <Building className="w-5 h-5" />
                <span>ARC Request</span>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-2xl text-yellow-400 hover:bg-yellow-500/30 transition-colors">
                <Calendar className="w-5 h-5" />
                <span>Schedule Meeting</span>
              </button>
            </>
          ) : (
            <>
              <button className="flex items-center space-x-3 p-4 bg-blue-500/20 border border-blue-500/30 rounded-2xl text-blue-400 hover:bg-blue-500/30 transition-colors">
                <FileText className="w-5 h-5" />
                <span>New Application</span>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-400 hover:bg-green-500/30 transition-colors">
                <Shield className="w-5 h-5" />
                <span>Generate Lease</span>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-400 hover:bg-purple-500/30 transition-colors">
                <Users className="w-5 h-5" />
                <span>Run Credit Check</span>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-2xl text-yellow-400 hover:bg-yellow-500/30 transition-colors">
                <Activity className="w-5 h-5" />
                <span>View Analytics</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <activity.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{activity.title}</h3>
                <p className="text-gray-400 text-sm">{activity.description}</p>
                <span className="text-gray-500 text-xs">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {communityType === 'hoa' ? 'Dues Collection Rate' : 'Occupancy Trend'}
            </h3>
            <BarChart3 className="w-6 h-6 text-purple-400" />
          </div>
          <div className="h-48 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chart visualization would go here</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {communityType === 'hoa' ? 'Community Engagement' : 'Revenue Breakdown'}
            </h3>
            <PieChart className="w-6 h-6 text-blue-400" />
          </div>
          <div className="h-48 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chart visualization would go here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewContent