import Link from 'next/link'
import { ArrowRight, Mic, TrendingUp, Phone, Bot, Users, Shield, BarChart, Sparkles, Scale, FileText, Gavel, Home, MessageSquare, Calendar, Building, Key, MapPin, DollarSign } from 'lucide-react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs"

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient-shift"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-green-600/10 via-transparent to-blue-600/10 animate-gradient-shift-reverse"></div>
      
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
                <Link href="/products" className="text-white px-3 py-2 text-sm font-medium">
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
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all ml-4">
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
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Our Products
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Cutting-edge AI solutions designed to transform your business operations and accelerate growth
          </p>
        </div>
      </section>

      {/* Featured Product - LeadFly */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-pink-900/30 backdrop-blur-xl rounded-2xl border border-purple-500/50 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-2 rounded-full">
                FEATURED
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  LeadFly™ AI
                </h2>
                <p className="text-xl text-gray-300 mb-6">
                  Advanced AI-powered lead generation platform that delivers high-quality, conversion-ready prospects through intelligent multi-channel automation.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <TrendingUp className="w-6 h-6 text-purple-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">2.4M+ Leads Generated</span>
                      <p className="text-gray-400 text-sm">Proven track record of success</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Shield className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">95.7% AI Accuracy</span>
                      <p className="text-gray-400 text-sm">Industry-leading precision</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <BarChart className="w-6 h-6 text-pink-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">$127M+ Revenue Generated</span>
                      <p className="text-gray-400 text-sm">For our clients worldwide</p>
                    </div>
                  </li>
                </ul>
                <Link 
                  href="https://leadflyai.com" 
                  target="_blank"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Visit LeadFly™ AI
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-3xl opacity-30"></div>
                <div className="relative bg-black/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-900/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white">500+</div>
                      <div className="text-sm text-purple-300">Leads/Month</div>
                    </div>
                    <div className="bg-blue-900/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white">80%</div>
                      <div className="text-sm text-blue-300">Profit Margins</div>
                    </div>
                    <div className="bg-pink-900/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white">&lt;1s</div>
                      <div className="text-sm text-pink-300">Processing</div>
                    </div>
                    <div className="bg-green-900/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white">24/7</div>
                      <div className="text-sm text-green-300">Automation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Maya AI Assistant */}
      <section id="maya" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-blue-900/30 via-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-3xl opacity-30"></div>
                  <div className="relative bg-black/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <Mic className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-blue-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-300">Natural Language Processing</span>
                          <span className="text-xs text-blue-400">Advanced</span>
                        </div>
                      </div>
                      <div className="bg-indigo-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-indigo-300">Voice Recognition</span>
                          <span className="text-xs text-indigo-400">99.5%</span>
                        </div>
                      </div>
                      <div className="bg-purple-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-purple-300">Multi-Language Support</span>
                          <span className="text-xs text-purple-400">50+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center mb-4">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                    NEW
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Maya™ AI Assistant
                </h2>
                <p className="text-xl text-gray-300 mb-6">
                  Your personal AI assistant that automates everything - phone calls, appointments, emails, data entry, and daily tasks. Never miss an opportunity or fall behind on work again.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Phone className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">Smart Phone Management</span>
                      <p className="text-gray-400 text-sm">Handles calls, takes messages, books appointments</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Bot className="w-6 h-6 text-indigo-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">Email & Calendar Automation</span>
                      <p className="text-gray-400 text-sm">Manages schedules, sends follow-ups, organizes tasks</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-6 h-6 text-purple-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">Data Entry & Organization</span>
                      <p className="text-gray-400 text-sm">Automates paperwork, updates CRM, maintains records</p>
                    </div>
                  </li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/products/maya"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    Learn More About Maya™
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link 
                    href="/products/maya"
                    className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all text-center"
                  >
                    View Features
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LawFly Pro */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-amber-900/30 via-yellow-900/30 to-orange-900/30 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center mb-4">
                  <span className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                    LEGAL AI
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  LawFly™ Pro
                </h2>
                <p className="text-xl text-gray-300 mb-6">
                  Enterprise law firm backend system with multi-tenant architecture, attorney-client privilege protection, and complete case management automation. Built for firms handling high-stakes litigation.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Scale className="w-6 h-6 text-amber-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">Attorney-Client Privilege Protection</span>
                      <p className="text-gray-400 text-sm">Database-level privilege enforcement with field encryption</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">Electronic Signature System</span>
                      <p className="text-gray-400 text-sm">Legally binding signatures with tamper-proof audit trails</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Gavel className="w-6 h-6 text-orange-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">Multi-Tenant Case Management</span>
                      <p className="text-gray-400 text-sm">Complete isolation between law firms with role-based access</p>
                    </div>
                  </li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/products/lawfly"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all"
                  >
                    Learn More About LawFly™ Pro
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link 
                    href="https://lawflyai.com" 
                    target="_blank"
                    className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all text-center"
                  >
                    Visit Live Site
                  </Link>
                </div>
              </div>
              
              <div className="order-2 md:order-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl blur-3xl opacity-30"></div>
                  <div className="relative bg-black/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
                        <Scale className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-amber-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-amber-300">Database Tables</span>
                          <span className="text-xs text-amber-400">25+ Enterprise</span>
                        </div>
                      </div>
                      <div className="bg-yellow-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-yellow-300">Query Performance</span>
                          <span className="text-xs text-yellow-400">&lt;200ms Avg</span>
                        </div>
                      </div>
                      <div className="bg-orange-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-orange-300">Security Compliance</span>
                          <span className="text-xs text-orange-400">SOC 2 Type II</span>
                        </div>
                      </div>
                      <div className="bg-red-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-red-300">Uptime SLA</span>
                          <span className="text-xs text-red-400">99.9%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HomeFly - Social Community Platform */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-green-900/30 via-teal-900/30 to-blue-900/30 backdrop-blur-xl rounded-2xl border border-green-500/30 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl blur-3xl opacity-30"></div>
                  <div className="relative bg-black/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center">
                        <Home className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-green-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-300">Database Tables</span>
                          <span className="text-xs text-green-400">29 Optimized</span>
                        </div>
                      </div>
                      <div className="bg-teal-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-teal-300">Real-time Updates</span>
                          <span className="text-xs text-teal-400">&lt;500ms</span>
                        </div>
                      </div>
                      <div className="bg-blue-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-300">User Engagement</span>
                          <span className="text-xs text-blue-400">40% Daily Active</span>
                        </div>
                      </div>
                      <div className="bg-cyan-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-cyan-300">Community Size</span>
                          <span className="text-xs text-cyan-400">100-500 Residents</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center mb-4">
                  <span className="bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                    SOCIAL COMMUNITY
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  HomeFly™ Pro
                </h2>
                <p className="text-xl text-gray-300 mb-6">
                  Social-first community management platform for HOAs and large apartment buildings. The &ldquo;TikTok + Instagram of property management&rdquo; with rent/dues collection and real-time community engagement.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <MessageSquare className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">Social Community Feed</span>
                      <p className="text-gray-400 text-sm">Facebook-style social network for residents and tenants</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Calendar className="w-6 h-6 text-teal-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">Event & Meeting Management</span>
                      <p className="text-gray-400 text-sm">Community calendar with RSVPs and video meetings</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">Rent & Dues Collection</span>
                      <p className="text-gray-400 text-sm">Automated rent collection for apartments and HOA dues processing</p>
                    </div>
                  </li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/products/homefly"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-green-600 to-teal-600 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all"
                  >
                    Learn More About HomeFly™ Pro
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <button className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all text-center">
                    View Demo Community
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RealFly Pro - Real Estate Platform */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-orange-900/30 via-red-900/30 to-pink-900/30 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl blur-3xl opacity-30"></div>
                  <div className="relative bg-black/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                        <Building className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-orange-400 mb-2 font-semibold">COMING SOON</div>
                      <h3 className="text-xl font-semibold text-white mb-4">Real Estate Platform</h3>
                      <p className="text-gray-400 text-sm mb-6">Complete real estate business automation</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                        <span className="text-gray-300 text-sm">Lead Generation</span>
                        <span className="text-orange-400 font-semibold">AI-Powered</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                        <span className="text-gray-300 text-sm">CRM Integration</span>
                        <span className="text-red-400 font-semibold">Automated</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                        <span className="text-gray-300 text-sm">Transaction Management</span>
                        <span className="text-pink-400 font-semibold">End-to-End</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                        <span className="text-gray-300 text-sm">Market Analytics</span>
                        <span className="text-orange-400 font-semibold">Real-Time</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 md:order-2">
                <h2 className="text-4xl font-bold text-white mb-6">
                  RealFly™ Pro
                </h2>
                <p className="text-xl text-gray-300 mb-6">
                  Complete real estate business automation platform. From lead generation to closing, everything you need to run a successful real estate operation in one streamlined system.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Key className="w-6 h-6 text-orange-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">Property Management</span>
                      <p className="text-gray-400 text-sm">Complete property portfolio management and tenant relations</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <MapPin className="w-6 h-6 text-red-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">Market Intelligence</span>
                      <p className="text-gray-400 text-sm">AI-driven market analysis and investment opportunities</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <DollarSign className="w-6 h-6 text-pink-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">Financial Analytics</span>
                      <p className="text-gray-400 text-sm">ROI tracking, cash flow analysis, and profit optimization</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-6 h-6 text-orange-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-white font-semibold">Client Portal</span>
                      <p className="text-gray-400 text-sm">Automated client onboarding and communication workflows</p>
                    </div>
                  </li>
                </ul>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/products/realfly"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all"
                  >
                    Get Early Access
                  </Link>
                  <Link 
                    href="/products/realfly"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all"
                  >
                    Learn More
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              More Products Coming Soon
            </h2>
            <p className="text-xl text-gray-400">
              We&apos;re constantly innovating to bring you the best AI solutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-600/20 to-transparent rounded-bl-full"></div>
              <Sparkles className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">AI Content Studio</h3>
              <p className="text-gray-400 text-sm mb-4">Advanced content generation and optimization platform</p>
              <span className="text-green-400 text-sm font-semibold">Coming Q2 2025</span>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-600/20 to-transparent rounded-bl-full"></div>
              <Shield className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">SecureAI Platform</h3>
              <p className="text-gray-400 text-sm mb-4">Enterprise security and compliance automation</p>
              <span className="text-orange-400 text-sm font-semibold">Coming Q3 2025</span>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-600/20 to-transparent rounded-bl-full"></div>
              <BarChart className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Analytics AI</h3>
              <p className="text-gray-400 text-sm mb-4">Predictive analytics and business intelligence</p>
              <span className="text-red-400 text-sm font-semibold">Coming Q4 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Start with any of our products and scale as you grow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              Get Started Today
            </button>
            <button className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/50 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 DropFly™. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}