'use client'

import React, { useState } from 'react'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  User, 
  BookOpen, 
  Video, 
  Award, 
  Target, 
  FileText, 
  Users, 
  Mail, 
  Settings, 
  CreditCard, 
  Shield, 
  Star,
  ChevronRight,
  ChevronDown,
  Download,
  Monitor,
  Smartphone,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Database
} from 'lucide-react'

interface TrainingModule {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
  videoUrl: string
  completed: boolean
  topics: string[]
  keyFeatures: string[]
}

interface EmployeeTrainingProps {
  employeeName?: string
  onProgressUpdate?: (moduleId: string, completed: boolean) => void
}

export default function EmployeeTraining({
  employeeName = "New Leasing Agent",
  onProgressUpdate
}: EmployeeTrainingProps) {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('overview')
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  const trainingModules: TrainingModule[] = [
    {
      id: 'dashboard-overview',
      title: 'Leasing Dashboard Overview',
      description: 'Complete introduction to your leasing dashboard and navigation',
      duration: '8 min',
      difficulty: 'Beginner',
      category: 'overview',
      videoUrl: 'https://demo-video-url/dashboard-overview',
      completed: false,
      topics: ['Dashboard navigation', 'Sidebar menu', 'User profile', 'Quick actions'],
      keyFeatures: ['Navigation basics', 'Menu organization', 'Status indicators', 'Mobile responsiveness']
    },
    {
      id: 'application-management',
      title: 'Managing Applications',
      description: 'Learn to review, process, and approve rental applications',
      duration: '12 min',
      difficulty: 'Beginner',
      category: 'applications',
      videoUrl: 'https://demo-video-url/applications',
      completed: false,
      topics: ['Application review', 'Status updates', 'Applicant communication', 'Document management'],
      keyFeatures: ['Application filtering', 'Status tracking', 'Bulk actions', 'Search functionality']
    },
    {
      id: 'credit-income-verification',
      title: 'Credit & Income Verification',
      description: 'Master the tenant screening and verification process',
      duration: '15 min',
      difficulty: 'Intermediate',
      category: 'verification',
      videoUrl: 'https://demo-video-url/verification',
      completed: false,
      topics: ['Credit report analysis', 'Income verification', 'Employment checks', 'Background screening'],
      keyFeatures: ['AI-powered analysis', 'Risk assessment', 'Verification workflows', 'Compliance checks']
    },
    {
      id: 'approval-emails',
      title: 'Sending Approval Emails',
      description: 'Generate and customize approval emails with move-in cost calculations',
      duration: '10 min',
      difficulty: 'Beginner',
      category: 'communication',
      videoUrl: 'https://demo-video-url/approval-emails',
      completed: false,
      topics: ['Email templates', 'Cost calculations', 'PDF generation', 'Email customization'],
      keyFeatures: ['Automated calculations', 'Professional templates', 'Preview mode', 'Draft saving']
    },
    {
      id: 'moveout-process',
      title: 'Move-Out Processing',
      description: 'Handle tenant move-outs with automated procedures and cost calculations',
      duration: '14 min',
      difficulty: 'Intermediate',
      category: 'communication',
      videoUrl: 'https://demo-video-url/moveout',
      completed: false,
      topics: ['Move-out notices', 'Financial calculations', 'Inspection scheduling', 'Deposit processing'],
      keyFeatures: ['Early termination handling', 'Deposit calculations', 'Procedure checklists', 'Timeline management']
    },
    {
      id: 'property-settings',
      title: 'Property Configuration',
      description: 'Configure property-specific settings, fees, and qualification criteria',
      duration: '11 min',
      difficulty: 'Advanced',
      category: 'settings',
      videoUrl: 'https://demo-video-url/property-settings',
      completed: false,
      topics: ['Fee structures', 'Qualification criteria', 'Move-in specials', 'Property policies'],
      keyFeatures: ['Dynamic pricing', 'Criteria management', 'Special offers', 'Compliance settings']
    },
    {
      id: 'lease-management',
      title: 'Digital Lease Management',
      description: 'Create, manage, and execute digital leases with electronic signatures',
      duration: '16 min',
      difficulty: 'Intermediate',
      category: 'leases',
      videoUrl: 'https://demo-video-url/leases',
      completed: false,
      topics: ['Lease generation', 'Digital signatures', 'Document management', 'Lease renewals'],
      keyFeatures: ['Template system', 'E-signature integration', 'Version control', 'Automated workflows']
    },
    {
      id: 'financial-reporting',
      title: 'Financial Management & Reports',
      description: 'Generate financial reports and manage property revenue tracking',
      duration: '13 min',
      difficulty: 'Advanced',
      category: 'reports',
      videoUrl: 'https://demo-video-url/financial',
      completed: false,
      topics: ['Revenue tracking', 'Report generation', 'Payment processing', 'Analytics dashboard'],
      keyFeatures: ['Real-time analytics', 'Custom reports', 'Payment integration', 'Performance metrics']
    }
  ]

  const categories = [
    { id: 'overview', label: 'Getting Started', icon: Monitor, count: 1 },
    { id: 'applications', label: 'Applications', icon: FileText, count: 1 },
    { id: 'verification', label: 'Verification', icon: Shield, count: 1 },
    { id: 'communication', label: 'Communication', icon: Mail, count: 2 },
    { id: 'leases', label: 'Lease Management', icon: Database, count: 1 },
    { id: 'settings', label: 'Configuration', icon: Settings, count: 1 },
    { id: 'reports', label: 'Reports & Analytics', icon: TrendingUp, count: 1 }
  ]

  const filteredModules = trainingModules.filter(module => module.category === selectedCategory)
  const completedCount = trainingModules.filter(module => module.completed).length
  const totalModules = trainingModules.length
  const progressPercentage = (completedCount / totalModules) * 100

  const handlePlayVideo = (moduleId: string) => {
    setPlayingVideo(playingVideo === moduleId ? null : moduleId)
    setActiveModule(moduleId)
  }

  const handleCompleteModule = (moduleId: string) => {
    // In a real app, this would update the database
    const moduleIndex = trainingModules.findIndex(m => m.id === moduleId)
    if (moduleIndex !== -1) {
      trainingModules[moduleIndex].completed = true
      onProgressUpdate?.(moduleId, true)
    }
    setPlayingVideo(null)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-500/20'
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/20'
      case 'Advanced': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Leasing Agent Training</h2>
            <p className="text-white/60">Welcome {employeeName} - Master your leasing dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-white/60 text-sm">Training Progress</p>
            <p className="text-white font-semibold">{completedCount}/{totalModules} modules</p>
          </div>
          <div className="w-20 h-20 relative">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="30"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-white/20"
              />
              <circle
                cx="40"
                cy="40"
                r="30"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - progressPercentage / 100)}`}
                className="text-purple-400 transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <Video className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{totalModules}</h3>
          <p className="text-white/60 text-sm">Training Videos</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">2.5 hrs</h3>
          <p className="text-white/60 text-sm">Total Duration</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{completedCount}</h3>
          <p className="text-white/60 text-sm">Completed</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{progressPercentage >= 100 ? '🏆' : '⏳'}</h3>
          <p className="text-white/60 text-sm">Certification</p>
        </div>
      </div>

      {/* Training Categories & Content */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Category Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Training Categories</h3>
            <nav className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon
                const isActive = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{category.label}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isActive ? 'bg-purple-400/30 text-purple-200' : 'bg-white/20 text-white/60'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Training Modules */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {filteredModules.map((module) => (
              <div key={module.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                {/* Module Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-xl font-bold text-white">{module.title}</h4>
                        {module.completed && (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                          {module.difficulty}
                        </span>
                      </div>
                      <p className="text-white/70 mb-4">{module.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-white/60">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{module.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>Leasing Agents</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        {expandedModule === module.id ? (
                          <ChevronDown className="w-5 h-5 text-white/60" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-white/60" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handlePlayVideo(module.id)}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
                      >
                        {playingVideo === module.id ? (
                          <>
                            <Pause className="w-5 h-5" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            <span>Start Training</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Module Details */}
                {expandedModule === module.id && (
                  <div className="p-6 bg-white/2">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-white font-semibold mb-3">Topics Covered</h5>
                        <ul className="space-y-2">
                          {module.topics.map((topic, index) => (
                            <li key={index} className="flex items-center space-x-2 text-white/70 text-sm">
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-white font-semibold mb-3">Key Features</h5>
                        <ul className="space-y-2">
                          {module.keyFeatures.map((feature, index) => (
                            <li key={index} className="flex items-center space-x-2 text-white/70 text-sm">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video Player Area */}
                {playingVideo === module.id && (
                  <div className="p-6 bg-black/20">
                    <div className="bg-black rounded-2xl overflow-hidden">
                      <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                        <div className="text-center">
                          <Video className="w-16 h-16 text-white/60 mx-auto mb-4" />
                          <p className="text-white/60 text-lg mb-4">Training Video: {module.title}</p>
                          <p className="text-white/40 text-sm mb-6">
                            In a real implementation, this would display the actual training video
                          </p>
                          <div className="flex items-center justify-center space-x-4">
                            <button
                              onClick={() => setPlayingVideo(null)}
                              className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span>Restart</span>
                            </button>
                            <button
                              onClick={() => handleCompleteModule(module.id)}
                              className="flex items-center space-x-2 px-6 py-2 bg-green-500 hover:bg-green-400 rounded-xl text-white font-medium transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Mark Complete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Training Resources */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">Additional Resources</h3>
            <p className="text-white/60">Supplementary materials and quick reference guides</p>
          </div>
          <BookOpen className="w-12 h-12 text-purple-400" />
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">Quick Reference Guide</h4>
            <p className="text-white/60 text-sm mb-4">Printable cheat sheet for common tasks</p>
            <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-colors text-sm">
              Download PDF
            </button>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">Support Chat</h4>
            <p className="text-white/60 text-sm mb-4">Get help from experienced agents</p>
            <button className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-colors text-sm">
              Start Chat
            </button>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">Best Practices</h4>
            <p className="text-white/60 text-sm mb-4">Tips and tricks from top performers</p>
            <button className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-300 hover:bg-yellow-500/30 transition-colors text-sm">
              View Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}