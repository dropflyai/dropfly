'use client'

import Link from 'next/link'
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Users, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Star,
  BarChart3,
  FileText,
  Calendar
} from 'lucide-react'

export default function RealFlyPage() {
  const features = [
    {
      icon: Building,
      title: "Property Portfolio Management",
      description: "Complete property management suite with automated tenant screening, lease management, and maintenance coordination.",
      benefits: ["Automated tenant screening", "Digital lease management", "Maintenance request tracking"]
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence Platform", 
      description: "AI-powered market analysis with real-time property valuations, investment opportunity identification, and trend forecasting.",
      benefits: ["Real-time valuations", "Investment analytics", "Market trend forecasting"]
    },
    {
      icon: DollarSign,
      title: "Financial Management Hub",
      description: "Comprehensive financial tracking with automated rent collection, expense management, and ROI optimization tools.",
      benefits: ["Automated collections", "Expense tracking", "ROI optimization"]
    },
    {
      icon: Users,
      title: "Client Relationship Management",
      description: "Advanced CRM with automated lead nurturing, client portal access, and communication workflow automation.",
      benefits: ["Lead nurturing", "Client portal", "Automated communication"]
    }
  ]

  const capabilities = [
    {
      title: "Lead Generation",
      description: "AI-powered lead identification and qualification with automated follow-up sequences.",
      metrics: "300% increase in qualified leads",
      icon: TrendingUp
    },
    {
      title: "Property Analysis",
      description: "Comprehensive property evaluation with market comparisons and investment potential scoring.",
      metrics: "95% accuracy in valuations", 
      icon: BarChart3
    },
    {
      title: "Transaction Management",
      description: "End-to-end transaction coordination with document management and deadline tracking.",
      metrics: "50% faster closings",
      icon: FileText
    },
    {
      title: "Tenant Relations",
      description: "Automated tenant communication with maintenance requests and lease renewal management.",
      metrics: "90% tenant satisfaction",
      icon: Users
    },
    {
      title: "Market Monitoring",
      description: "Real-time market data analysis with investment opportunity alerts and trend reporting.",
      metrics: "24/7 market surveillance",
      icon: MapPin
    },
    {
      title: "Financial Reporting",
      description: "Automated financial reporting with tax preparation assistance and profit optimization.",
      metrics: "99% reporting accuracy",
      icon: DollarSign
    }
  ]

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Real Estate Investment Firm Owner",
      content: "RealFly™ Pro transformed our entire operation. We've automated 80% of our processes and doubled our portfolio in just 6 months.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez", 
      role: "Property Management Company CEO",
      content: "The tenant management features alone saved us 20 hours per week. The ROI tracking helps us make smarter investment decisions.",
      rating: 5
    },
    {
      name: "Jennifer Kim",
      role: "Real Estate Agent & Investor",
      content: "Finally, a platform built specifically for real estate professionals. The market intelligence features are game-changing.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="relative bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                DropFly™
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
                All Products
              </Link>
              <Link href="/#solutions" className="text-gray-300 hover:text-white transition-colors">
                Solutions
              </Link>
              <Link href="/#authority" className="text-gray-300 hover:text-white transition-colors">
                Why DropFly™
              </Link>
              <button className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all">
                Get Early Access
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-red-600/20 to-pink-600/20 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-600/10 via-transparent to-orange-600/10 animate-gradient-shift-reverse"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-full border border-white/10 mb-6">
                <Building className="w-4 h-4 text-orange-400 mr-2" />
                <span className="text-sm text-gray-300">Real Estate Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                  RealFly™
                </span>
                <br />
                <span className="text-white">Pro</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl">
                Complete real estate business automation platform. From lead generation to property management, everything you need to build and scale your real estate empire.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all">
                  <PlayCircle className="mr-2 w-5 h-5" />
                  Get Early Access
                </button>
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
                  Schedule Demo Call
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Coming Q2 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Early Access Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Beta Testing Program</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Real Estate Intelligence</h3>
                  <p className="text-gray-400 text-sm">Powered by Advanced AI & Market Data</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">Properties Analyzed</span>
                    <span className="text-orange-400 font-semibold">50K+ Daily</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">Market Accuracy</span>
                    <span className="text-red-400 font-semibold">95.7%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">ROI Improvement</span>
                    <span className="text-pink-400 font-semibold">+127%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">Time Saved</span>
                    <span className="text-orange-400 font-semibold">40 hrs/week</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Enterprise-Grade Real Estate Infrastructure
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built specifically for real estate professionals who demand precision, automation, and scalability in their business operations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-black/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 mb-6">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Back Office Command Center */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-900/10 to-red-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Your Real Estate Back Office Command Center
            </h2>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto">
              RealFly™ Pro doesn&apos;t just manage properties—it runs your entire real estate operation. From deal flow to financial reporting, 
              every aspect of your business is automated, optimized, and intelligently managed.
            </p>
          </div>

          {/* Executive Dashboard Mock */}
          <div className="mb-16">
            <div className="bg-black/70 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Executive Dashboard</h3>
                  <p className="text-gray-400">Real-time business intelligence at your fingertips</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Portfolio Value</div>
                  <div className="text-3xl font-bold text-green-400">$12.4M</div>
                  <div className="text-sm text-green-400">↗ +18.7% YTD</div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 rounded-xl p-4 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <Building className="w-8 h-8 text-orange-400" />
                    <span className="text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">Live</span>
                  </div>
                  <div className="text-2xl font-bold text-white">47</div>
                  <div className="text-sm text-gray-400">Active Properties</div>
                  <div className="text-xs text-green-400 mt-1">+3 this month</div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl p-4 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <DollarSign className="w-8 h-8 text-blue-400" />
                    <span className="text-xs bg-blue-400/20 text-blue-400 px-2 py-1 rounded">Monthly</span>
                  </div>
                  <div className="text-2xl font-bold text-white">$89K</div>
                  <div className="text-sm text-gray-400">Rental Income</div>
                  <div className="text-xs text-blue-400 mt-1">96.8% collected</div>
                </div>

                <div className="bg-gradient-to-br from-green-900/40 to-teal-900/40 rounded-xl p-4 border border-green-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                    <span className="text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">AI</span>
                  </div>
                  <div className="text-2xl font-bold text-white">127</div>
                  <div className="text-sm text-gray-400">Hot Leads</div>
                  <div className="text-xs text-green-400 mt-1">23% conv. rate</div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                    <span className="text-xs bg-purple-400/20 text-purple-400 px-2 py-1 rounded">ROI</span>
                  </div>
                  <div className="text-2xl font-bold text-white">18.7%</div>
                  <div className="text-sm text-gray-400">Annual Return</div>
                  <div className="text-xs text-purple-400 mt-1">Above market</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-black/50 rounded-xl p-6 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <MapPin className="w-5 h-5 text-orange-400 mr-2" />
                    Market Opportunities
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg border border-green-500/20">
                      <div>
                        <div className="text-white font-medium">1247 Oak Street</div>
                        <div className="text-sm text-gray-400">Undervalued by $47K • 12% ROI potential</div>
                      </div>
                      <div className="text-green-400 text-sm font-semibold">BUY</div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                      <div>
                        <div className="text-white font-medium">892 Pine Avenue</div>
                        <div className="text-sm text-gray-400">Refinance opportunity • Save $280/mo</div>
                      </div>
                      <div className="text-blue-400 text-sm font-semibold">REFI</div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                      <div>
                        <div className="text-white font-medium">456 Maple Drive</div>
                        <div className="text-sm text-gray-400">Market peak • Consider selling</div>
                      </div>
                      <div className="text-yellow-400 text-sm font-semibold">SELL</div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/50 rounded-xl p-6 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Calendar className="w-5 h-5 text-orange-400 mr-2" />
                    Today&apos;s Action Items
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-red-900/20 rounded-lg border border-red-500/20">
                      <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <div className="text-white text-sm">Property inspection due</div>
                        <div className="text-xs text-gray-400">1247 Oak Street • 2:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-orange-900/20 rounded-lg border border-orange-500/20">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <div className="text-white text-sm">Lease renewal reminder</div>
                        <div className="text-xs text-gray-400">Unit 4B expires in 30 days</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <div className="text-white text-sm">Follow up with hot lead</div>
                        <div className="text-xs text-gray-400">Sarah M. • Interested in downtown condo</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon
              return (
                <div key={index} className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{capability.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{capability.description}</p>
                  <div className="text-xs text-green-400 font-semibold bg-green-400/10 px-3 py-1 rounded-full">
                    {capability.metrics}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Unique Value Propositions */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">Why RealFly™ Pro is Different</h3>
              <p className="text-xl text-gray-400">We don&apos;t just digitize your process—we reinvent it</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-2xl p-8 border border-orange-500/30">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4 text-center">AI-First Architecture</h4>
                <p className="text-gray-300 text-center mb-6">
                  Every decision is backed by machine learning models trained on millions of real estate transactions. 
                  No guesswork, just data-driven insights.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Property Valuation Accuracy</span>
                    <span className="text-orange-400 font-semibold">95.7%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Market Prediction Rate</span>
                    <span className="text-orange-400 font-semibold">89.3%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Deal Success Rate</span>
                    <span className="text-orange-400 font-semibold">78.1%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-blue-500/30">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4 text-center">Predictive Operations</h4>
                <p className="text-gray-300 text-center mb-6">
                  Don&apos;t just react to market changes—anticipate them. Our AI predicts maintenance needs, 
                  market shifts, and investment opportunities before they happen.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Maintenance Prediction</span>
                    <span className="text-blue-400 font-semibold">92% Accurate</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Market Timing</span>
                    <span className="text-blue-400 font-semibold">67% Better</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cost Savings</span>
                    <span className="text-blue-400 font-semibold">$40K/year</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 rounded-2xl p-8 border border-green-500/30">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4 text-center">Autonomous Workflows</h4>
                <p className="text-gray-300 text-center mb-6">
                  Your business runs itself. From tenant screening to lease renewals to property acquisitions, 
                  critical processes execute automatically while you focus on strategy.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Process Automation</span>
                    <span className="text-green-400 font-semibold">87% Tasks</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Time Saved Weekly</span>
                    <span className="text-green-400 font-semibold">40 Hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Error Reduction</span>
                    <span className="text-green-400 font-semibold">94% Less</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Real Estate Professionals
            </h2>
            <p className="text-xl text-gray-400">
              Join thousands of agents, investors, and property managers who are scaling their business with RealFly™ Pro
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specs Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-900/10 to-red-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Enterprise Technical Specifications
            </h2>
            <p className="text-xl text-gray-400">
              Built on cutting-edge technology with real estate industry compliance and security standards
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <Building className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">50K+ Properties</h3>
              <p className="text-gray-400 text-sm">Daily market analysis coverage</p>
            </div>
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <TrendingUp className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Real-Time Data</h3>
              <p className="text-gray-400 text-sm">Live market updates and alerts</p>
            </div>
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <FileText className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Document AI</h3>
              <p className="text-gray-400 text-sm">Automated contract processing</p>
            </div>
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <Users className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Tenant</h3>
              <p className="text-gray-400 text-sm">Scalable team collaboration</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-900/20 to-red-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Real Estate Business?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join the early access program and be among the first to experience the future of real estate automation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all">
              Get Early Access
            </button>
            <button className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
              Schedule Demo Call
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            Limited early access spots • Expected launch Q2 2025 • Beta testing available now
          </p>
        </div>
      </section>
    </div>
  )
}