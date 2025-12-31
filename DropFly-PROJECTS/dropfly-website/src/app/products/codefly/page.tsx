'use client'

import Link from 'next/link'
import { ArrowRight, Gamepad2, BookOpen, Shield, Bot, CheckCircle } from 'lucide-react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs"
import CodeFlyDemoModal from '@/components/CodeFlyDemoModal'
import { useState } from 'react'

export default function CodeFlyPage() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-cyan-600/20 to-emerald-600/20 animate-gradient-shift"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 via-transparent to-blue-600/10 animate-gradient-shift-reverse"></div>
      
      {/* Navigation */}
      <nav className="relative bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                DropFly™
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link href="/products" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  Products
                </Link>
                <Link href="/#solutions" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  Solutions
                </Link>
                <Link href="/#pricing" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  Pricing
                </Link>
                <Link href="/#about" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  About
                </Link>
                <SignedOut>
                  <SignInButton>
                    <button className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-violet-700 hover:to-cyan-700 transition-all ml-4">
                      Get Started
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center mb-6">
              <span className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-bold px-6 py-2 rounded-full">
                🎮 EDUCATION AI • GAMIFIED LEARNING
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-violet-400 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                CodeFly™ Pro
              </span>
            </h1>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto mb-12">
              Transform your school into a coding powerhouse with the most engaging AI-powered education platform ever built. Where coding meets adventure.
            </p>
            
            {/* Key Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-violet-500/30">
                <div className="text-3xl font-bold text-violet-400 mb-2">87%</div>
                <div className="text-sm text-gray-300">Completion Rate</div>
                <div className="text-xs text-gray-500">vs 42% industry avg</div>
              </div>
              <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/30">
                <div className="text-3xl font-bold text-cyan-400 mb-2">4.8★</div>
                <div className="text-sm text-gray-300">Student Rating</div>
                <div className="text-xs text-gray-500">out of 5 stars</div>
              </div>
              <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-emerald-500/30">
                <div className="text-3xl font-bold text-emerald-400 mb-2">100%</div>
                <div className="text-sm text-gray-300">Standards Coverage</div>
                <div className="text-xs text-gray-500">CPALMS aligned</div>
              </div>
              <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-amber-500/30">
                <div className="text-3xl font-bold text-amber-400 mb-2">95%</div>
                <div className="text-sm text-gray-300">Teacher Confidence</div>
                <div className="text-xs text-gray-500">after training</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setIsDemoModalOpen(true)}
                className="px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg hover:from-violet-700 hover:to-cyan-700 transition-all inline-flex items-center justify-center"
              >
                Schedule Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
                Watch Video
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* The CodeFly Difference */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">The CodeFly™ Difference</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Not just another coding curriculum—a complete educational ecosystem that makes learning to code an epic adventure
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-violet-900/30 via-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-2xl border border-violet-500/30 p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Full Gamification</h3>
              <p className="text-gray-300 mb-6">XP points, achievement badges, team competitions, and leaderboards transform learning into an engaging quest through the Black Cipher adventure.</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• 50 XP for project completion</li>
                <li>• 20+ achievement badges</li>
                <li>• Team draft competitions</li>
                <li>• Progress leaderboards</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/30 via-blue-900/30 to-indigo-900/30 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mb-6">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Coach Nova AI</h3>
              <p className="text-gray-300 mb-6">Intelligent AI tutor with complete teacher control. Provides hints without giving answers, adapts to learning pace, and maintains curriculum alignment.</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Teacher-controlled assistance levels</li>
                <li>• 95.7% accuracy rate</li>
                <li>• 24/7 homework help</li>
                <li>• Real-time progress tracking</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/30 via-green-900/30 to-teal-900/30 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Complete Curriculum</h3>
              <p className="text-gray-300 mb-6">18-week adventure through Python, AI basics, and web development. Fully CPALMS-aligned with automated grading and evidence collection.</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• 36 fully-scripted lessons</li>
                <li>• 200+ coding exercises</li>
                <li>• Automated assessments</li>
                <li>• Standards documentation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Black Cipher Adventure */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/50 via-slate-900/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-gray-500/30 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-bold px-4 py-2 rounded-full">
                🎯 CLASSIFIED
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  The Black Cipher Mission
                </h2>
                <p className="text-xl text-gray-300 mb-6">
                  Students become elite agents infiltrating the Digital Fortress to neutralize the rogue Black Cipher AI. Each lesson is a mission in this epic 18-week adventure.
                </p>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-violet-500 pl-6">
                    <h4 className="font-bold text-white">Phase 1: Shadow Protocol (Weeks 1-6)</h4>
                    <p className="text-gray-400 text-sm">Python mastery through spy-themed challenges</p>
                  </div>
                  <div className="border-l-4 border-cyan-500 pl-6">
                    <h4 className="font-bold text-white">Phase 2: Cipher Command (Weeks 7-9)</h4>
                    <p className="text-gray-400 text-sm">AI integration and team formation</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-6">
                    <h4 className="font-bold text-white">Phase 3: Ghost Protocol (Weeks 10-13)</h4>
                    <p className="text-gray-400 text-sm">Web development and digital presence</p>
                  </div>
                  <div className="border-l-4 border-amber-500 pl-6">
                    <h4 className="font-bold text-white">Phase 4: Quantum Breach (Weeks 14-18)</h4>
                    <p className="text-gray-400 text-sm">Final capstone project showcase</p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-slate-600 rounded-xl blur-3xl opacity-30"></div>
                <div className="relative bg-black/70 backdrop-blur-xl rounded-xl p-8 border border-white/20">
                  <div className="text-center mb-6">
                    <div className="text-lg font-bold text-green-400 mb-2">&gt;&gt; MISSION STATUS: ACTIVE</div>
                    <div className="text-sm text-gray-400">Agent Classification: Student</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-violet-900/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white">4</div>
                      <div className="text-xs text-violet-300">Mission Phases</div>
                    </div>
                    <div className="bg-cyan-900/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white">18</div>
                      <div className="text-xs text-cyan-300">Weeks Training</div>
                    </div>
                    <div className="bg-emerald-900/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white">200+</div>
                      <div className="text-xs text-emerald-300">Challenges</div>
                    </div>
                    <div className="bg-amber-900/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white">100%</div>
                      <div className="text-xs text-amber-300">Success Rate</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                    <div className="text-xs text-red-400 font-mono">
                      [CLASSIFIED] AI TUTOR: COACH NOVA<br />
                      Status: ACTIVE | Security: TEACHER-CONTROLLED
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teacher Experience */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Complete Teacher Control & Support</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to run a world-class computer science program from Day 1, with complete AI oversight
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">One-Click Lesson Deployment</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <span className="text-white font-semibold">Complete Lesson Plans</span>
                    <p className="text-gray-400 text-sm">Minute-by-minute run-of-show for every class</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <span className="text-white font-semibold">AI Tutor Settings</span>
                    <p className="text-gray-400 text-sm">Pre-configured for appropriate assistance levels</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <span className="text-white font-semibold">Auto-Grading Rubrics</span>
                    <p className="text-gray-400 text-sm">Aligned to standards with evidence collection</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <span className="text-white font-semibold">XP & Badge Configuration</span>
                    <p className="text-gray-400 text-sm">Gamification ready to go out of the box</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-6 mt-12">AI Tutor Control Panel</h3>
              <div className="space-y-4">
                <div className="bg-black/50 backdrop-blur-xl rounded-lg p-4 border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-400 font-semibold">Three Modes</span>
                    <span className="text-xs bg-cyan-900/50 px-2 py-1 rounded text-cyan-300">OFF / LEARN / ASSESS</span>
                  </div>
                  <p className="text-gray-400 text-sm">Complete control over when AI assistance is available</p>
                </div>
                <div className="bg-black/50 backdrop-blur-xl rounded-lg p-4 border border-violet-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-violet-400 font-semibold">Scope Control</span>
                    <span className="text-xs bg-violet-900/50 px-2 py-1 rounded text-violet-300">TIGHT / NORMAL / OPEN</span>
                  </div>
                  <p className="text-gray-400 text-sm">Limit AI knowledge to current lesson or full curriculum</p>
                </div>
                <div className="bg-black/50 backdrop-blur-xl rounded-lg p-4 border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-400 font-semibold">Content Filtering</span>
                    <span className="text-xs bg-emerald-900/50 px-2 py-1 rounded text-emerald-300">TEACHER DEFINED</span>
                  </div>
                  <p className="text-gray-400 text-sm">Allowlist topics, blocklist patterns, control output length</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-900/30 via-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-xl p-8 border border-blue-500/30">
                <h4 className="text-xl font-bold text-white mb-4">Real-Time Monitoring</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-900/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-white">24/7</div>
                    <div className="text-xs text-blue-300">AI Oversight</div>
                  </div>
                  <div className="bg-indigo-900/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-white">Live</div>
                    <div className="text-xs text-indigo-300">Progress Tracking</div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">Monitor all AI conversations and student progress in real-time with instant policy adjustments</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-900/30 via-teal-900/30 to-cyan-900/30 backdrop-blur-xl rounded-xl p-8 border border-green-500/30">
                <h4 className="text-xl font-bold text-white mb-4">Automated Evidence Collection</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-green-900/30 rounded">
                    <span className="text-green-300 text-sm">Functionality</span>
                    <span className="text-green-400 font-semibold">40%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-teal-900/30 rounded">
                    <span className="text-teal-300 text-sm">Code Quality</span>
                    <span className="text-teal-400 font-semibold">25%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-cyan-900/30 rounded">
                    <span className="text-cyan-300 text-sm">Documentation</span>
                    <span className="text-cyan-400 font-semibold">15%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-900/30 rounded">
                    <span className="text-blue-300 text-sm">Creativity</span>
                    <span className="text-blue-400 font-semibold">20%</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mt-4">Automatic CPALMS standards evidence with exportable portfolios</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment & ROI */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Investment & Return</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Complete 2-year program with measurable results and guaranteed satisfaction
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-amber-900/30 via-orange-900/30 to-red-900/30 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Complete Program Investment</h3>
              
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">Student Licenses (120 students)</span>
                    <span className="text-amber-400 font-bold">$200/student</span>
                  </div>
                  <div className="text-gray-400 text-sm">Per semester pricing includes platform, AI tutor, curriculum</div>
                </div>
                
                <div className="border-b border-white/10 pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">Year 1 Complete</span>
                    <span className="text-orange-400 font-bold">$63,000</span>
                  </div>
                  <div className="text-gray-400 text-sm">Includes setup, training, and both semesters</div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-lg">2-Year Program Total</span>
                    <span className="text-amber-300 font-bold text-2xl">$111,000</span>
                  </div>
                  <div className="text-amber-200 text-sm mt-2">Complete transformation of your CS program</div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-lg font-bold text-white mb-4">What&apos;s Included</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-300">36 Complete Lessons</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-300">AI Tutor Platform</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-300">Teacher Training</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-300">24/7 Support</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-300">Standards Alignment</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-300">Parent Portal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-900/30 via-emerald-900/30 to-teal-900/30 backdrop-blur-xl rounded-xl p-8 border border-green-500/30">
                <h4 className="text-xl font-bold text-white mb-6">Proven Results</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">87%</div>
                    <div className="text-sm text-green-300">Completion Rate</div>
                    <div className="text-xs text-gray-400">vs 42% industry</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-400 mb-1">92%</div>
                    <div className="text-sm text-emerald-300">Standards Mastery</div>
                    <div className="text-xs text-gray-400">state assessments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-400 mb-1">4.8★</div>
                    <div className="text-sm text-teal-300">Student Rating</div>
                    <div className="text-xs text-gray-400">satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400 mb-1">95%</div>
                    <div className="text-sm text-cyan-300">Teacher Confidence</div>
                    <div className="text-xs text-gray-400">after training</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-900/30 via-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-xl p-8 border border-blue-500/30">
                <h4 className="text-xl font-bold text-white mb-4">Our Guarantees</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold text-sm">Implementation</span>
                      <p className="text-gray-400 text-xs">Full deployment within 30 days</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold text-sm">Uptime SLA</span>
                      <p className="text-gray-400 text-xs">99.9% platform availability</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold text-sm">Satisfaction</span>
                      <p className="text-gray-400 text-xs">90-day trial period guarantee</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-violet-900/30 via-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-xl p-8 border border-violet-500/30">
                <h4 className="text-xl font-bold text-white mb-4">Special Launch Pricing</h4>
                <p className="text-gray-300 mb-4">Lock in these rates with a 2-year commitment</p>
                <div className="bg-violet-900/50 rounded-lg p-4 text-center">
                  <div className="text-lg font-bold text-violet-300">Save $15,000</div>
                  <div className="text-sm text-violet-400">vs year-by-year pricing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Launch Your CodeFly™ Program?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join the schools already transforming their computer science education
          </p>
          
          <div className="bg-gradient-to-br from-violet-900/30 via-cyan-900/30 to-emerald-900/30 backdrop-blur-xl rounded-2xl border border-violet-500/30 p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">Next Steps</h3>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-bold text-white text-sm">Schedule Demo</h4>
                <p className="text-gray-400 text-xs">See CodeFly in action</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-bold text-white text-sm">Pilot Program</h4>
                <p className="text-gray-400 text-xs">30-day risk-free trial</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-bold text-white text-sm">Teacher Training</h4>
                <p className="text-gray-400 text-xs">3 comprehensive sessions</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="font-bold text-white text-sm">Go Live</h4>
                <p className="text-gray-400 text-xs">Full implementation</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setIsDemoModalOpen(true)}
              className="px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg hover:from-violet-700 hover:to-cyan-700 transition-all inline-flex items-center justify-center"
            >
              Schedule Your Demo Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <Link href="mailto:support@dropflyai.com?subject=CodeFly Sales Inquiry" className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all text-center">
              Contact Sales Team
            </Link>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-2">
              <strong className="text-white">CodeFly™ by DropFly AI</strong>
            </p>
            <p className="text-sm text-gray-500">
              📧 support@dropflyai.com • 🌐 www.codeflyai.com
            </p>
            <div className="flex justify-center space-x-4 mt-4 text-xs text-gray-500">
              <span>✓ Florida CPALMS Aligned</span>
              <span>✓ FERPA Compliant</span>
              <span>✓ WCAG 2.2 AA Accessible</span>
              <span>✓ SOC 2 Type II Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/50 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 DropFly™. All rights reserved.</p>
            <p className="text-sm mt-2 italic">CodeFly: Where Coding Meets Adventure</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <CodeFlyDemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </div>
  )
}