'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, Circle, Lock, Trophy, Zap, Code, FileText, Rocket, Play, ChevronRight, User } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  completedModules: string[]
  currentModule: string | null
  progress: number
  startDate: string
  avatar: string
}

export default function LearnPage() {
  const [currentUser, setCurrentUser] = useState<string>('')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [currentModule, setCurrentModule] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [showUserSelector, setShowUserSelector] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // Avatar options
  const avatars = ['🚀', '⚡', '🎯', '🔥', '💎', '🌟', '🎨', '🛠️', '🧠', '👑']

  useEffect(() => {
    // Load users from localStorage
    const savedUsers = localStorage.getItem('osAppBuilderUsers')
    const savedCurrentUser = localStorage.getItem('osAppBuilderCurrentUser')
    
    if (savedUsers) {
      const userData = JSON.parse(savedUsers)
      setUsers(userData)
      
      if (savedCurrentUser && userData.find((u: UserProfile) => u.id === savedCurrentUser)) {
        setCurrentUser(savedCurrentUser)
        const user = userData.find((u: UserProfile) => u.id === savedCurrentUser)
        if (user) {
          setCompletedModules(user.completedModules)
          setCurrentModule(user.currentModule)
          setProgress(user.progress)
        }
      } else if (userData.length > 0) {
        // Auto-select first user if no current user set
        const firstUser = userData[0]
        setCurrentUser(firstUser.id)
        setCompletedModules(firstUser.completedModules)
        setCurrentModule(firstUser.currentModule)
        setProgress(firstUser.progress)
        localStorage.setItem('osAppBuilderCurrentUser', firstUser.id)
      } else {
        setShowUserSelector(true)
      }
    } else {
      setShowUserSelector(true)
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      // Calculate progress
      const total = modules.reduce((acc, section) => acc + section.lessons.length, 0)
      const completed = completedModules.length
      const newProgress = Math.round((completed / total) * 100)
      setProgress(newProgress)
      
      // Update user progress
      const updatedUsers = users.map(user => 
        user.id === currentUser 
          ? { ...user, completedModules, currentModule, progress: newProgress }
          : user
      )
      setUsers(updatedUsers)
      
      // Save to localStorage
      localStorage.setItem('osAppBuilderUsers', JSON.stringify(updatedUsers))
    }
  }, [completedModules, currentModule, currentUser, users, modules])

  const createUser = () => {
    if (!newUserName.trim()) return
    
    const newUser: UserProfile = {
      id: Date.now().toString(),
      name: newUserName.trim(),
      completedModules: [],
      currentModule: null,
      progress: 0,
      startDate: new Date().toISOString(),
      avatar: avatars[Math.floor(Math.random() * avatars.length)]
    }
    
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    setCurrentUser(newUser.id)
    setCompletedModules([])
    setCurrentModule(null)
    setProgress(0)
    setShowUserSelector(false)
    setNewUserName('')
    
    localStorage.setItem('osAppBuilderUsers', JSON.stringify(updatedUsers))
    localStorage.setItem('osAppBuilderCurrentUser', newUser.id)
  }

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setCurrentUser(userId)
      setCompletedModules(user.completedModules)
      setCurrentModule(user.currentModule)
      setProgress(user.progress)
      setShowUserSelector(false)
      localStorage.setItem('osAppBuilderCurrentUser', userId)
    }
  }

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId)
    setUsers(updatedUsers)
    localStorage.setItem('osAppBuilderUsers', JSON.stringify(updatedUsers))
    
    if (currentUser === userId) {
      if (updatedUsers.length > 0) {
        switchUser(updatedUsers[0].id)
      } else {
        setCurrentUser('')
        setCompletedModules([])
        setCurrentModule(null)
        setProgress(0)
        setShowUserSelector(true)
        localStorage.removeItem('osAppBuilderCurrentUser')
      }
    }
  }

  const toggleComplete = (moduleId: string) => {
    if (completedModules.includes(moduleId)) {
      setCompletedModules(completedModules.filter(id => id !== moduleId))
    } else {
      setCompletedModules([...completedModules, moduleId])
    }
  }

  const modules = [
    {
      id: 'getting-started',
      title: '🚀 Getting Started',
      description: 'Master the fundamentals in your first hour',
      color: 'from-blue-600 to-purple-600',
      lessons: [
        { id: 'gs-1', title: 'Understanding the System Architecture', time: '5 min', command: 'ls -la' },
        { id: 'gs-2', title: 'Initial Setup & Configuration', time: '10 min', command: 'chmod +x *.sh' },
        { id: 'gs-3', title: 'Your First Version Save', time: '5 min', command: './save-version.sh "my first save"' },
        { id: 'gs-4', title: 'Understanding the Frameworks', time: '15 min', command: 'cat CLAUDE.md' }
      ]
    },
    {
      id: 'daily-workflow',
      title: '📅 Daily Workflow',
      description: 'Build muscle memory with core commands',
      color: 'from-purple-600 to-pink-600',
      lessons: [
        { id: 'dw-1', title: 'Morning Routine: Status Check', time: '2 min', command: './dev.sh status' },
        { id: 'dw-2', title: 'Creating & Managing Projects', time: '10 min', command: './create-demo.sh' },
        { id: 'dw-3', title: 'Version Control Mastery', time: '15 min', command: './save-version.sh' },
        { id: 'dw-4', title: 'Emergency Saves & Recovery', time: '5 min', command: './emergency-save.sh' },
        { id: 'dw-5', title: 'End of Day Backup', time: '5 min', command: './auto-commit.sh' }
      ]
    },
    {
      id: 'enterprise-backend',
      title: '🏗️ Enterprise Backend',
      description: 'Build production-grade infrastructure',
      color: 'from-green-600 to-teal-600',
      lessons: [
        { id: 'eb-1', title: 'Enterprise Framework Overview', time: '20 min', command: 'cat ENTERPRISE-BACKEND-FRAMEWORK.md' },
        { id: 'eb-2', title: 'Database Schema Design', time: '30 min', command: 'supabase init' },
        { id: 'eb-3', title: 'Row Level Security (RLS)', time: '25 min', command: 'supabase db push' },
        { id: 'eb-4', title: 'Performance Optimization', time: '20 min', command: 'supabase functions serve' },
        { id: 'eb-5', title: 'Monitoring & Health Checks', time: '15 min', command: './health-check.sh' }
      ]
    },
    {
      id: 'ai-integration',
      title: '🤖 AI Integration',
      description: 'Implement cutting-edge AI features',
      color: 'from-orange-600 to-red-600',
      lessons: [
        { id: 'ai-1', title: 'Setting Up AI Agents', time: '15 min', command: 'npm install @anthropic/claude' },
        { id: 'ai-2', title: 'Voice Agent Implementation', time: '30 min', command: 'npm run dev:voice' },
        { id: 'ai-3', title: 'Chat Interface Building', time: '25 min', command: 'npm run dev:chat' },
        { id: 'ai-4', title: 'AI Workflow Automation', time: '20 min', command: './generate.sh ai-workflow' }
      ]
    },
    {
      id: 'deployment',
      title: '🚢 Deployment & DevOps',
      description: 'Ship to production with confidence',
      color: 'from-yellow-600 to-orange-600',
      lessons: [
        { id: 'dp-1', title: 'Vercel Deployment Setup', time: '10 min', command: 'vercel' },
        { id: 'dp-2', title: 'GitHub Integration', time: '15 min', command: 'git remote add origin' },
        { id: 'dp-3', title: 'CI/CD Pipeline', time: '20 min', command: './deploy.sh production' },
        { id: 'dp-4', title: 'Monitoring Production', time: '10 min', command: './health-check.sh prod' }
      ]
    },
    {
      id: 'advanced',
      title: '⚡ Advanced Techniques',
      description: 'Master the power user features',
      color: 'from-indigo-600 to-blue-600',
      lessons: [
        { id: 'adv-1', title: 'Multi-Agent Workflows', time: '25 min', command: 'claude task --agent=general' },
        { id: 'adv-2', title: 'Custom Framework Creation', time: '30 min', command: './generate.sh framework' },
        { id: 'adv-3', title: 'Performance Profiling', time: '20 min', command: 'npm run analyze' },
        { id: 'adv-4', title: 'Security Hardening', time: '25 min', command: './security-audit.sh' },
        { id: 'adv-5', title: 'Scaling Strategies', time: '30 min', command: 'supabase functions deploy' }
      ]
    }
  ]

  const totalLessons = modules.reduce((acc, section) => acc + section.lessons.length, 0)
  const completedCount = completedModules.length

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient-shift"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-green-600/10 via-transparent to-blue-600/10 animate-gradient-shift-reverse"></div>
      
      {/* Navigation */}
      <nav className="relative bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                OS App Builder
              </Link>
              <span className="text-sm text-gray-400">Learning Center</span>
            </div>
            <div className="flex items-center space-x-6">
              {/* Current User Display */}
              {currentUser && (
                <div className="flex items-center space-x-3">
                  <div 
                    className="flex items-center space-x-2 bg-gray-900/50 rounded-lg px-3 py-1 cursor-pointer hover:bg-gray-900/70 transition-all"
                    onClick={() => setShowUserSelector(!showUserSelector)}
                  >
                    <span className="text-lg">
                      {users.find(u => u.id === currentUser)?.avatar}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {users.find(u => u.id === currentUser)?.name}
                    </span>
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )}
              
              {/* Leaderboard Button */}
              {users.length > 1 && (
                <button 
                  onClick={() => setShowLeaderboard(!showLeaderboard)}
                  className="flex items-center space-x-1 text-sm text-gray-300 hover:text-white transition-all"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Leaderboard</span>
                </button>
              )}
              
              {/* Progress Display */}
              <div className="text-sm text-gray-300">
                Progress: <span className="font-bold text-white">{progress}%</span>
              </div>
              <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* User Selector Modal */}
      {showUserSelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/20 p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {users.length === 0 ? 'Welcome! Create Your Profile' : 'Select User'}
            </h2>
            
            {/* Existing Users */}
            {users.length > 0 && (
              <div className="space-y-3 mb-6">
                {users.map(user => (
                  <div 
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all cursor-pointer"
                    onClick={() => switchUser(user.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{user.avatar}</span>
                      <div>
                        <div className="font-semibold text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.progress}% complete</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${user.progress}%` }}
                        />
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteUser(user.id)
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Create New User */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Create New User</h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Enter name..."
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createUser()}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={createUser}
                  disabled={!newUserName.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Create
                </button>
              </div>
            </div>
            
            {users.length > 0 && (
              <button 
                onClick={() => setShowUserSelector(false)}
                className="w-full mt-4 px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && users.length > 1 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/20 p-8 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
                Leaderboard
              </h2>
              <button 
                onClick={() => setShowLeaderboard(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {users
                .sort((a, b) => b.progress - a.progress)
                .map((user, index) => (
                  <div 
                    key={user.id}
                    className={`flex items-center space-x-4 p-4 rounded-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30' :
                      index === 1 ? 'bg-gradient-to-r from-gray-600/20 to-gray-700/20 border border-gray-500/30' :
                      index === 2 ? 'bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30' :
                      'bg-gray-800 border border-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl font-bold text-white w-8 text-center">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                      </div>
                      <span className="text-2xl">{user.avatar}</span>
                      <div>
                        <div className="font-semibold text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">
                          Started {new Date(user.startDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-2xl font-bold text-white">{user.progress}%</div>
                      <div className="text-sm text-gray-400">
                        {user.completedModules.length} lessons completed
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Motivational Message */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30 text-center">
              <p className="text-sm text-gray-300">
                🚀 Keep learning and climb the leaderboard!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Master OS App Builder
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              From beginner to 10x developer in 30 days. Interactive lessons, real commands, and hands-on practice.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-black/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-white mb-1">{totalLessons}</div>
                <div className="text-xs text-gray-400">Total Lessons</div>
              </div>
              <div className="bg-black/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-green-400 mb-1">{completedCount}</div>
                <div className="text-xs text-gray-400">Completed</div>
              </div>
              <div className="bg-black/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-blue-400 mb-1">{modules.length}</div>
                <div className="text-xs text-gray-400">Modules</div>
              </div>
              <div className="bg-black/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-purple-400 mb-1">{progress}%</div>
                <div className="text-xs text-gray-400">Progress</div>
              </div>
            </div>
          </div>

          {/* Achievement Banner */}
          {progress === 100 && (
            <div className="mb-8 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-xl rounded-xl p-6 border border-yellow-500/30 text-center">
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white mb-2">🎉 Congratulations! You&apos;ve Mastered OS App Builder!</h3>
              <p className="text-gray-300">You&apos;re now a certified 10x developer. Time to build something amazing!</p>
            </div>
          )}

          {/* Learning Path */}
          <div className="space-y-8">
            {modules.map((module, moduleIndex) => {
              const isLocked = moduleIndex > 0 && 
                modules[moduleIndex - 1].lessons.some(lesson => 
                  !completedModules.includes(lesson.id)
                )
              
              const moduleCompleted = module.lessons.every(lesson => 
                completedModules.includes(lesson.id)
              )
              
              const moduleProgress = module.lessons.filter(lesson => 
                completedModules.includes(lesson.id)
              ).length

              return (
                <div key={module.id} className={`
                  bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden
                  ${isLocked ? 'opacity-50' : 'hover:border-white/20'}
                  transition-all duration-300
                `}>
                  {/* Module Header */}
                  <div className={`p-6 bg-gradient-to-r ${module.color} bg-opacity-10`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-white">{module.title}</h2>
                          {moduleCompleted && (
                            <Trophy className="w-6 h-6 text-yellow-400" />
                          )}
                          {isLocked && (
                            <Lock className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <p className="text-gray-300 mb-3">{module.description}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-400">
                            {moduleProgress}/{module.lessons.length} lessons completed
                          </span>
                          <div className="flex-1 max-w-xs h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${module.color} transition-all duration-500`}
                              style={{ width: `${(moduleProgress / module.lessons.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      {currentModule === module.id && (
                        <button 
                          onClick={() => setCurrentModule(null)}
                          className="text-gray-400 hover:text-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Module Lessons */}
                  <div className="p-6">
                    <div className="space-y-3">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const isCompleted = completedModules.includes(lesson.id)
                        const isAvailable = !isLocked && (
                          lessonIndex === 0 || 
                          completedModules.includes(module.lessons[lessonIndex - 1].id)
                        )

                        return (
                          <div 
                            key={lesson.id}
                            className={`
                              group relative flex items-center gap-4 p-4 rounded-xl
                              ${isAvailable ? 'bg-gray-900/50 hover:bg-gray-900/70 cursor-pointer' : 'bg-gray-900/20'}
                              ${isCompleted ? 'border border-green-500/30' : 'border border-white/5'}
                              transition-all duration-200
                            `}
                            onClick={() => isAvailable && toggleComplete(lesson.id)}
                          >
                            {/* Status Icon */}
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <CheckCircle className="w-6 h-6 text-green-400" />
                              ) : isAvailable ? (
                                <Circle className="w-6 h-6 text-gray-400 group-hover:text-white" />
                              ) : (
                                <Lock className="w-6 h-6 text-gray-600" />
                              )}
                            </div>

                            {/* Lesson Content */}
                            <div className="flex-1">
                              <h3 className={`font-semibold mb-1 ${
                                isCompleted ? 'text-green-400' : 
                                isAvailable ? 'text-white' : 'text-gray-500'
                              }`}>
                                {lesson.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-400">⏱ {lesson.time}</span>
                                {lesson.command && (
                                  <code className="px-2 py-1 bg-black/50 rounded text-xs text-blue-400 font-mono">
                                    {lesson.command}
                                  </code>
                                )}
                              </div>
                            </div>

                            {/* Action Button */}
                            {isAvailable && !isCompleted && (
                              <Play className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <FileText className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Documentation</h3>
              <p className="text-gray-400 text-sm mb-4">Access all framework docs and references</p>
              <Link href="#" className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-flex items-center">
                Open Docs <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <Code className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Practice Mode</h3>
              <p className="text-gray-400 text-sm mb-4">Interactive coding challenges and exercises</p>
              <Link href="#" className="text-purple-400 hover:text-purple-300 text-sm font-medium inline-flex items-center">
                Start Practice <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <Rocket className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Quick Start</h3>
              <p className="text-gray-400 text-sm mb-4">Jump into a new project with templates</p>
              <Link href="#" className="text-green-400 hover:text-green-300 text-sm font-medium inline-flex items-center">
                New Project <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-12 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 backdrop-blur-xl rounded-xl p-8 border border-yellow-500/30">
            <div className="flex items-start gap-4">
              <Zap className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Pro Tips for Faster Learning</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Complete lessons in order - each builds on the previous</li>
                  <li>• Practice each command in your terminal as you learn</li>
                  <li>• Save your work frequently with version control</li>
                  <li>• Join our Discord community for help and support</li>
                  <li>• Aim for at least 3 lessons per day to maintain momentum</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-20 bg-black/50 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>OS App Builder Learning Center • Track your journey to mastery</p>
            <p className="text-sm mt-2">Your progress is automatically saved</p>
          </div>
        </div>
      </footer>
    </div>
  )
}