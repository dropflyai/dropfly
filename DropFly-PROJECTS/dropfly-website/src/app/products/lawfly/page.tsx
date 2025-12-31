'use client'

import Link from 'next/link'
import { 
  Scale, 
  FileText, 
  Gavel, 
  Shield, 
  Database, 
  Users, 
  Clock,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Star,
  Search,
  Calendar,
  DollarSign
} from 'lucide-react'

export default function LawFlyPage() {
  const features = [
    {
      icon: Scale,
      title: "Attorney-Client Privilege Protection",
      description: "Database-level privilege enforcement with field-level encryption ensures complete protection of confidential communications.",
      benefits: ["Field-level encryption", "Privilege detection", "Audit trail compliance"]
    },
    {
      icon: FileText,
      title: "Electronic Signature System", 
      description: "Legally binding electronic signatures with tamper-proof verification and multi-party workflow support.",
      benefits: ["Legal validity", "Audit trails", "Multi-party workflows"]
    },
    {
      icon: Database,
      title: "Enterprise Backend Architecture",
      description: "25+ database tables with multi-tenant isolation, ensuring complete separation between law firms.",
      benefits: ["Multi-tenant isolation", "Performance optimization", "Scalable architecture"]
    },
    {
      icon: Shield,
      title: "Legal Compliance & Security",
      description: "SOC 2 Type II compliance with built-in data retention policies and secure document management.",
      benefits: ["SOC 2 compliance", "Data retention", "Secure storage"]
    }
  ]

  const capabilities = [
    {
      title: "Case Management",
      description: "Complete case lifecycle management from intake to resolution with deadline tracking.",
      metrics: "500+ concurrent users per firm",
      icon: Gavel
    },
    {
      title: "Document Management",
      description: "Version-controlled document storage with OCR processing and privilege detection.",
      metrics: "99.9% encryption compliance",
      icon: FileText
    },
    {
      title: "Time & Billing",
      description: "Automated time tracking with billing integration and financial reporting.",
      metrics: "40% reduction in billing time", 
      icon: DollarSign
    },
    {
      title: "Legal Research",
      description: "Integrated case law research with citation management and brief generation.",
      metrics: "10x faster research",
      icon: Search
    },
    {
      title: "Calendar Management",
      description: "Court date tracking with automated reminders and conflict detection.",
      metrics: "Zero missed deadlines",
      icon: Calendar
    },
    {
      title: "Communication Hub",
      description: "Secure messaging with client portal access and privilege protection.",
      metrics: "95% client satisfaction",
      icon: Users
    }
  ]

  const testimonials = [
    {
      name: "Carl E. Douglas",
      role: "Founding Partner, Douglass Hicks Law Firm",
      content: "LawFly™ Pro has revolutionized our practice management. The privilege protection and enterprise features are exactly what high-stakes litigation requires.",
      rating: 5
    },
    {
      name: "Jamon R. Hicks", 
      role: "Partner, Douglass Hicks Law Firm",
      content: "The multi-tenant architecture allows us to maintain complete client confidentiality while streamlining our case management workflows.",
      rating: 5
    },
    {
      name: "Senior Partner",
      role: "AmLaw 100 Firm",
      content: "Finally, a legal backend system built by developers who understand attorney-client privilege. The audit trails alone saved us during our last compliance review.",
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
              <button className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all">
                Request Demo
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-yellow-600/20 to-orange-600/20 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 via-transparent to-amber-600/10 animate-gradient-shift-reverse"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-full border border-white/10 mb-6">
                <Scale className="w-4 h-4 text-amber-400 mr-2" />
                <span className="text-sm text-gray-300">Enterprise Legal Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  LawFly™
                </span>
                <br />
                <span className="text-white">Pro</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl">
                Enterprise law firm backend system with multi-tenant architecture, attorney-client privilege protection, and complete case management automation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="https://lawflyai.com"
                  target="_blank"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all"
                >
                  <PlayCircle className="mr-2 w-5 h-5" />
                  View Live Demo
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
                  Enterprise Consultation
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Attorney-Client Privilege</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>99.9% Uptime SLA</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Scale className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Douglass Hicks Law Firm</h3>
                  <p className="text-gray-400 text-sm">Pilot Implementation - Live System</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">Database Tables</span>
                    <span className="text-amber-400 font-semibold">25+ Enterprise</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">Query Performance</span>
                    <span className="text-yellow-400 font-semibold">&lt;200ms</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">Security Compliance</span>
                    <span className="text-orange-400 font-semibold">SOC 2 Type II</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">Privilege Protection</span>
                    <span className="text-red-400 font-semibold">100% Encrypted</span>
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
              Enterprise-Grade Legal Infrastructure
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built from the ground up for law firms handling high-stakes litigation, with attorney-client privilege protection as the foundational principle.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-black/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center mb-6">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-900/10 to-orange-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Complete Legal Practice Management
            </h2>
            <p className="text-xl text-gray-400">
              Every component built for the demanding requirements of professional legal practice
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon
              return (
                <div key={index} className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
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

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Leading Legal Professionals
            </h2>
            <p className="text-xl text-gray-400">
              Built in partnership with Douglass Hicks Law Firm - O.J. Simpson &ldquo;Dream Team&rdquo; legacy
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-900/10 to-orange-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Enterprise Technical Specifications
            </h2>
            <p className="text-xl text-gray-400">
              Built on battle-tested enterprise architecture with legal compliance at every layer
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <Database className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">25+ Database Tables</h3>
              <p className="text-gray-400 text-sm">Complete legal workflow coverage</p>
            </div>
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <Shield className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Field-Level Encryption</h3>
              <p className="text-gray-400 text-sm">Attorney-client privilege protection</p>
            </div>
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <Clock className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">&lt;200ms Query Time</h3>
              <p className="text-gray-400 text-sm">Optimized for performance</p>
            </div>
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <Users className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Tenant Architecture</h3>
              <p className="text-gray-400 text-sm">Complete firm isolation</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-900/20 to-orange-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Legal Practice?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join the next generation of law firms using enterprise-grade backend systems built specifically for legal professionals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="https://lawflyai.com"
              target="_blank"
              className="px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all"
            >
              Schedule Enterprise Demo
            </Link>
            <button className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
              Request Technical Specs
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            SOC 2 compliant • Attorney-client privilege protected • 99.9% uptime SLA
          </p>
        </div>
      </section>
    </div>
  )
}