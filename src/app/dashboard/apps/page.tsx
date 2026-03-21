'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Zap,
  Brain,
  MessageSquare,
  Phone,
  FileText,
  Shield,
  TrendingUp,
  Settings
} from 'lucide-react'

export default function AppsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const apps = [
    {
      id: 1,
      name: 'Maya Voice Agent',
      description: 'AI-powered voice assistant for customer service',
      icon: Phone,
      status: 'active',
      category: 'Voice AI',
      usage: '12,543 calls',
      lastUpdated: '2 hours ago',
      performance: '+15%',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      id: 2,
      name: 'LeadFly AI',
      description: 'Intelligent lead generation and qualification system',
      icon: TrendingUp,
      status: 'active',
      category: 'Sales AI',
      usage: '8,234 leads',
      lastUpdated: '5 hours ago',
      performance: '+23%',
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 3,
      name: 'Support Chatbot',
      description: '24/7 customer support automation',
      icon: MessageSquare,
      status: 'active',
      category: 'Support AI',
      usage: '24,123 chats',
      lastUpdated: '1 day ago',
      performance: '+8%',
      color: 'from-green-600 to-emerald-600'
    },
    {
      id: 4,
      name: 'Document Analyzer',
      description: 'Extract insights from documents and PDFs',
      icon: FileText,
      status: 'beta',
      category: 'Document AI',
      usage: '3,456 docs',
      lastUpdated: '3 days ago',
      performance: '+12%',
      color: 'from-orange-600 to-red-600'
    },
    {
      id: 5,
      name: 'Security Monitor',
      description: 'AI-powered threat detection and response',
      icon: Shield,
      status: 'active',
      category: 'Security AI',
      usage: '156 threats blocked',
      lastUpdated: '1 hour ago',
      performance: '99.9%',
      color: 'from-red-600 to-pink-600'
    },
    {
      id: 6,
      name: 'Smart Analytics',
      description: 'Predictive analytics and business intelligence',
      icon: Brain,
      status: 'development',
      category: 'Analytics AI',
      usage: 'Coming soon',
      lastUpdated: 'In development',
      performance: 'N/A',
      color: 'from-indigo-600 to-purple-600'
    }
  ]

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Applications</h1>
          <p className="text-gray-400 mt-2">Manage and monitor your AI-powered applications</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Deploy New App
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/20"
          />
        </div>
        <button className="px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white hover:border-white/20 transition-all flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app) => {
          const Icon = app.icon
          return (
            <div
              key={app.id}
              className="bg-black/50 backdrop-blur-xl rounded-xl border border-white/10 hover:border-white/20 transition-all overflow-hidden"
            >
              {/* App Header */}
              <div className={`h-2 bg-gradient-to-r ${app.color}`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${app.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* App Info */}
                <h3 className="text-lg font-semibold text-white mb-2">{app.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{app.description}</p>

                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    app.status === 'active' 
                      ? 'bg-green-500/20 text-green-400'
                      : app.status === 'beta'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {app.status}
                  </span>
                  <span className="text-xs text-gray-400">{app.category}</span>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Usage</span>
                    <span className="text-white">{app.usage}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Performance</span>
                    <span className="text-green-400">{app.performance}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last updated</span>
                    <span className="text-gray-300">{app.lastUpdated}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-white/5 rounded-lg text-sm text-white hover:bg-white/10 transition-all flex items-center justify-center gap-1">
                    <Settings className="w-4 h-4" />
                    Configure
                  </button>
                  <button className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg text-sm text-blue-400 hover:from-blue-600/30 hover:to-purple-600/30 transition-all flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredApps.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No apps found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}