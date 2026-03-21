'use client'

import { useUser } from "@clerk/nextjs"
import { 
  Activity, 
  Users, 
  Zap, 
  TrendingUp,
  Brain,
  MessageSquare,
  FileCode,
  Clock
} from "lucide-react"

export default function DashboardPage() {
  const { user } = useUser()

  const stats = [
    { name: 'Active AI Agents', value: '12', icon: Brain, change: '+2 this week' },
    { name: 'API Calls', value: '48.2k', icon: Zap, change: '+12% from last month' },
    { name: 'Team Members', value: '8', icon: Users, change: '2 pending invites' },
    { name: 'Success Rate', value: '99.9%', icon: TrendingUp, change: '0.1% improvement' },
  ]

  const recentActivity = [
    { id: 1, type: 'deployment', message: 'Deployed Maya Voice Agent to production', time: '2 hours ago', icon: Zap },
    { id: 2, type: 'api', message: 'API rate limit increased to 100k/month', time: '5 hours ago', icon: FileCode },
    { id: 3, type: 'team', message: 'Sarah Johnson joined the team', time: '1 day ago', icon: Users },
    { id: 4, type: 'agent', message: 'Customer Service Bot updated with new responses', time: '2 days ago', icon: MessageSquare },
  ]

  const aiApps = [
    { name: 'Maya Voice Agent', status: 'active', calls: '12,543', satisfaction: '98%' },
    { name: 'LeadFly AI', status: 'active', calls: '8,234', satisfaction: '96%' },
    { name: 'Support Chatbot', status: 'active', calls: '24,123', satisfaction: '94%' },
    { name: 'Sales Predictor', status: 'beta', calls: '3,456', satisfaction: '92%' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.firstName || 'Developer'}
        </h1>
        <p className="text-gray-400 mt-2">
          Here&apos;s what&apos;s happening with your AI infrastructure today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                  <p className="text-xs text-green-400 mt-2">{stat.change}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Apps Performance */}
        <div className="lg:col-span-2 bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">AI Apps Performance</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-4 text-sm font-medium text-gray-400 pb-2 border-b border-white/10">
              <div>App Name</div>
              <div>Status</div>
              <div>Total Calls</div>
              <div>Satisfaction</div>
            </div>
            {aiApps.map((app) => (
              <div key={app.name} className="grid grid-cols-4 text-sm py-3 border-b border-white/5">
                <div className="font-medium text-white">{app.name}</div>
                <div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    app.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {app.status}
                  </span>
                </div>
                <div className="text-gray-300">{app.calls}</div>
                <div className="text-gray-300">{app.satisfaction}</div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View all apps →
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          <button className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View all activity →
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 bg-black/30 rounded-lg border border-white/10 hover:border-white/20 transition-all text-left">
            <Brain className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-sm font-medium text-white">Deploy New Agent</p>
            <p className="text-xs text-gray-400 mt-1">Launch AI in minutes</p>
          </button>
          <button className="p-4 bg-black/30 rounded-lg border border-white/10 hover:border-white/20 transition-all text-left">
            <FileCode className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-sm font-medium text-white">Generate API Key</p>
            <p className="text-xs text-gray-400 mt-1">For integrations</p>
          </button>
          <button className="p-4 bg-black/30 rounded-lg border border-white/10 hover:border-white/20 transition-all text-left">
            <Users className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-sm font-medium text-white">Invite Team Member</p>
            <p className="text-xs text-gray-400 mt-1">Expand your team</p>
          </button>
          <button className="p-4 bg-black/30 rounded-lg border border-white/10 hover:border-white/20 transition-all text-left">
            <Activity className="w-6 h-6 text-pink-400 mb-2" />
            <p className="text-sm font-medium text-white">View Analytics</p>
            <p className="text-xs text-gray-400 mt-1">Track performance</p>
          </button>
        </div>
      </div>
    </div>
  )
}