'use client'

import Link from 'next/link'
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  Users, 
  Shield, 
  DollarSign, 
  Settings,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Star,
  BarChart3,
  Bell,
  FileText,
  Vote,
  Wrench,
  Camera,
  Video
} from 'lucide-react'

export default function HomeFlyPage() {
  const features = [
    {
      icon: MessageSquare,
      title: "Social Community Feed",
      description: "Facebook-style social network where residents can share updates, photos, and connect with neighbors in real-time.",
      benefits: ["Real-time updates", "Photo and video sharing", "Community discussions"]
    },
    {
      icon: DollarSign,
      title: "Dual Payment Processing", 
      description: "Sophisticated payment system handling both apartment rent collection and HOA dues with role-based access controls and automated processing.",
      benefits: ["Apartment rent collection", "HOA monthly dues", "Role-based payment access"]
    },
    {
      icon: Wrench,
      title: "Maintenance Management",
      description: "Complete issue reporting system with photo uploads, priority tracking, and vendor assignment.",
      benefits: ["Photo documentation", "Status tracking", "Vendor coordination"]
    },
    {
      icon: Vote,
      title: "HOA Voting & Governance",
      description: "Secure digital voting platform for HOA decisions with homeowner-only voting rights, anonymous ballots, and comprehensive governance tools.",
      benefits: ["Homeowner-only voting", "Anonymous ballots", "Governance tracking"]
    }
  ]

  const capabilities = [
    {
      title: "Event Management",
      description: "Community calendar with RSVP tracking and integrated video meetings for board sessions.",
      metrics: "95% attendance increase",
      icon: Calendar
    },
    {
      title: "Document Library",
      description: "Centralized repository for bylaws, meeting minutes, and community guidelines.",
      metrics: "100% document accessibility",
      icon: FileText
    },
    {
      title: "Push Notifications",
      description: "Real-time alerts for emergencies, announcements, and community updates.",
      metrics: "Instant delivery", 
      icon: Bell
    },
    {
      title: "Resident Directory",
      description: "Private resident profiles linked to units with privacy controls and contact management.",
      metrics: "80% resident participation",
      icon: Users
    },
    {
      title: "Video Meetings",
      description: "Integrated Daily.co video conferencing for board meetings and community sessions.",
      metrics: "HD quality streaming",
      icon: Video
    },
    {
      title: "Analytics Dashboard",
      description: "Community engagement metrics and financial reporting for board oversight.",
      metrics: "Real-time insights",
      icon: BarChart3
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HOA Board President, Willowbrook Community",
      content: "The access control system is brilliant! As homeowners, we maintain voting rights and financial oversight while our renters enjoy the social features. HOA governance has never been more secure.",
      rating: 5
    },
    {
      name: "Michael Chen", 
      role: "Property Manager, Sunset Ridge Apartments (340 units)",
      content: "The rent collection and maintenance tracking has revolutionized our operations. 95% of residents now pay online and maintenance response time dropped to under 24 hours.",
      rating: 5
    },
    {
      name: "David Martinez",
      role: "Homeowner, Willowbrook HOA",
      content: "I invited my renter through the secure system - they love the social features and maintenance tools, but can't access voting or financial data. Perfect balance of community and security.",
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
                DropFly
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
                Why DropFly
              </Link>
              <button className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all">
                Start Free Community
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-teal-600/20 to-blue-600/20 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/10 via-transparent to-green-600/10 animate-gradient-shift-reverse"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600/20 to-teal-600/20 rounded-full border border-white/10 mb-6">
                <Home className="w-4 h-4 text-green-400 mr-2" />
                <span className="text-sm text-gray-300">Social Community Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 bg-clip-text text-transparent">
                  HomeFly
                </span>
                <br />
                <span className="text-white">Community</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl">
                The &quot;TikTok + Instagram of Property Management&quot; with secure HOA governance and apartment management - featuring homeowner-controlled access, voting rights protection, and dual payment processing.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-green-600 to-teal-600 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all">
                  <PlayCircle className="mr-2 w-5 h-5" />
                  View Demo Community
                </button>
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Free for 30 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>100-500 residents</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>No setup fees</span>
                </div>
              </div>
            </div>
            
            <div className="relative space-y-6">
              {/* HOA Demo */}
              <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-xl rounded-xl p-6 border border-blue-500/20">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Willowbrook HOA</h3>
                  <p className="text-gray-400 text-xs">124 Homeowners, 38 Renters</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-xs">HOA Dues Collection</span>
                    <span className="text-blue-400 font-semibold text-sm">98%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-xs">Voting Participation</span>
                    <span className="text-purple-400 font-semibold text-sm">87%</span>
                  </div>
                </div>
              </div>
              
              {/* Apartment Demo */}
              <div className="bg-gradient-to-br from-green-900/50 to-teal-900/50 backdrop-blur-xl rounded-xl p-6 border border-green-500/20">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Sunset Ridge Apartments</h3>
                  <p className="text-gray-400 text-xs">340 Units, 285 Active Residents</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-xs">Rent Collection Rate</span>
                    <span className="text-green-400 font-semibold text-sm">95%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-xs">Response Time</span>
                    <span className="text-teal-400 font-semibold text-sm">&lt;24hrs</span>
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
              Everything Your Community Needs
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From social networking to secure HOA governance, HomeFly combines social media engagement with role-based access controls and comprehensive property management.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-black/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center mb-6">
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

      {/* Capabilities Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-900/10 to-teal-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Complete Property Management Suite
            </h2>
            <p className="text-xl text-gray-400">
              Built specifically for modern HOAs and large apartment buildings
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon
              return (
                <div key={index} className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
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
        </div>
      </section>

      {/* HOA Security & Access Control */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900/10 to-purple-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Secure HOA Governance & Access Control
            </h2>
            <p className="text-xl text-gray-400">
              Protecting homeowner rights while enabling community engagement
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-xl rounded-xl p-8 border border-blue-500/30">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Homeowner Full Access</h3>
              <p className="text-gray-300 mb-6">Property owners receive complete platform access with voting rights, financial oversight, and the ability to invite renters to restricted accounts.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Vote className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300">Full voting rights on HOA matters</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300">Complete financial access and dues management</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300">Ability to invite and manage renter accounts</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/40 to-teal-900/40 backdrop-blur-xl rounded-xl p-8 border border-green-500/30">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Renter Restricted Access</h3>
              <p className="text-gray-300 mb-6">Tenants enjoy full social features and maintenance reporting while respecting homeowner governance rights and financial privacy.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Full social feed and community engagement</span>
                </div>
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Maintenance requests and issue reporting</span>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-400">No voting or financial access (view-only)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 max-w-4xl mx-auto">
              <h4 className="text-xl font-semibold text-white mb-3">Secure Invitation System</h4>
              <p className="text-gray-300">
                Homeowners create accounts and invite their renters with pre-configured restricted access. This ensures HOA governance integrity while maintaining community engagement for all residents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Features Highlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 backdrop-blur-xl rounded-2xl border border-green-500/30 p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Social-First Community Experience
              </h2>
              <p className="text-xl text-gray-300">
                Where neighbors become friends and communities thrive
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Photo & Video Sharing</h3>
                <p className="text-gray-400 text-sm">Share community moments, events, and updates with beautiful photo and video posts</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Real-time Conversations</h3>
                <p className="text-gray-400 text-sm">Instant messaging and group chats with neighbors, committees, and the board</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Community Groups</h3>
                <p className="text-gray-400 text-sm">Create interest groups, committees, and private spaces for focused discussions</p>
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
              Communities Love HomeFly
            </h2>
            <p className="text-xl text-gray-400">
              See what residents and property managers are saying about their experience
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
                <p className="text-gray-300 mb-6 italic">&quot;{testimonial.content}&quot;</p>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-900/10 to-teal-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Scale and Performance
            </h2>
            <p className="text-xl text-gray-400">
              Modern architecture designed for growing communities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <Home className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">29 Database Tables</h3>
              <p className="text-gray-400 text-sm">Comprehensive community data model</p>
            </div>
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <Shield className="w-12 h-12 text-teal-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Row Level Security</h3>
              <p className="text-gray-400 text-sm">Multi-tenant isolation protection</p>
            </div>
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">&lt;500ms Updates</h3>
              <p className="text-gray-400 text-sm">Real-time social feed performance</p>
            </div>
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <Users className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">500 Residents Max</h3>
              <p className="text-gray-400 text-sm">Optimized for community size</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-900/20 to-teal-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Community?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join the communities that are taking flight with social-first management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-green-600 to-teal-600 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all">
              Start Your Free Community
            </button>
            <button className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
              Schedule Community Demo
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            Free 30-day trial • No setup fees • 100-500 residents supported
          </p>
        </div>
      </section>
    </div>
  )
}