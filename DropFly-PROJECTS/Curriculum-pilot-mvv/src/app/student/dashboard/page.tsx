'use client'

import { useState } from 'react'

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons'>('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-white mb-6">🚀 CodeFly Dashboard - WORKING!</h1>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6">
          {['overview', 'lessons'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">✅ TROUBLESHOOTING SUCCESSFUL!</h2>
            <p className="text-purple-200 mb-4">This minimal version is working. Click Lessons tab to see the curriculum.</p>
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/30">
              <h3 className="font-bold text-green-400 mb-2">🎯 Next Steps:</h3>
              <ul className="text-sm text-green-200 space-y-1">
                <li>✅ Server is now running</li>
                <li>✅ Basic dashboard displays</li>
                <li>✅ Tab navigation works</li>
                <li>✅ Ready to add back full features</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">🚀 Foundation Phase - Python Mastery</h2>
            
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Week 1 Lesson */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all transform hover:scale-105 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">🚀</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Welcome to CodeQuest</h3>
                      <p className="text-purple-200 text-sm">First Interactive Program</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-lg">250 XP</div>
                    <div className="text-purple-200 text-sm">Week 1</div>
                  </div>
                </div>
                
                <p className="text-purple-200 mb-4">Begin your coding adventure! Create your first interactive Python program.</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-purple-200">
                    <span>3 Challenges</span>
                    <span>4 Goals</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-300">
                    <span>Start Quest</span>
                  </div>
                </div>
              </div>

              {/* Week 2 Lesson */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all transform hover:scale-105 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">🎯</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Loops & Events</h3>
                      <p className="text-purple-200 text-sm">Build a Clicker Game</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-lg">275 XP</div>
                    <div className="text-purple-200 text-sm">Week 2</div>
                  </div>
                </div>
                
                <p className="text-purple-200 mb-4">Master loops by building an addictive clicker game!</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-purple-200">
                    <span>3 Challenges</span>
                    <span>4 Goals</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-300">
                    <span>Start Quest</span>
                  </div>
                </div>
              </div>

              {/* Week 3 Lesson */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all transform hover:scale-105 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">🔢</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Python Basics</h3>
                      <p className="text-purple-200 text-sm">Number Guessing Game</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-lg">300 XP</div>
                    <div className="text-purple-200 text-sm">Week 3</div>
                  </div>
                </div>
                
                <p className="text-purple-200 mb-4">Dive deeper into Python fundamentals!</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-purple-200">
                    <span>3 Challenges</span>
                    <span>4 Goals</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-300">
                    <span>Start Quest</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Your CodeQuest Journey</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">🚀</div>
                  <h4 className="text-white font-medium">Foundation</h4>
                  <p className="text-purple-200 text-sm">Python Mastery</p>
                  <p className="text-purple-300 text-xs">Weeks 1-6</p>
                </div>
                <div className="text-center opacity-50">
                  <div className="text-3xl mb-2">🤖</div>
                  <h4 className="text-white font-medium">Innovation</h4>
                  <p className="text-purple-200 text-sm">AI Integration</p>
                  <p className="text-purple-300 text-xs">Coming Soon</p>
                </div>
                <div className="text-center opacity-50">
                  <div className="text-3xl mb-2">🌐</div>
                  <h4 className="text-white font-medium">Web Development</h4>
                  <p className="text-purple-200 text-sm">HTML & CSS</p>
                  <p className="text-purple-300 text-xs">Coming Soon</p>
                </div>
                <div className="text-center opacity-50">
                  <div className="text-3xl mb-2">🏆</div>
                  <h4 className="text-white font-medium">Capstone</h4>
                  <p className="text-purple-200 text-sm">Final Projects</p>
                  <p className="text-purple-300 text-xs">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}