'use client'

import Link from 'next/link'
import {
  Phone,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Star,
  BarChart3,
  Bot,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Shield
} from 'lucide-react'

export default function VoiceFlyPage() {
  const features = [
    {
      icon: Phone,
      title: "24/7 AI Voice Agents",
      description: "VAPI-powered voice AI that never misses a call. Handles customer inquiries, books appointments, and takes messages automatically.",
      benefits: ["Natural conversation flow", "Multi-language support", "Instant call answering"]
    },
    {
      icon: MessageSquare,
      title: "SMS Marketing Automation",
      description: "Twilio-powered SMS campaigns, appointment reminders, and customer engagement automation.",
      benefits: ["Automated text campaigns", "Smart scheduling", "Two-way messaging"]
    },
    {
      icon: Bot,
      title: "AI Research Assistant",
      description: "DeepSeek-R1 powered research at 98% lower cost than GPT-4. Get intelligent insights for just $0.14-0.50 per 1M tokens.",
      benefits: ["98% cost savings", "GPT-4 level quality", "Lightning fast"]
    },
    {
      icon: DollarSign,
      title: "Credit-Based Pricing",
      description: "Pay only for what you use with our flexible credit system. 85% gross margins mean maximum value for your business.",
      benefits: ["$99-399/month plans", "Pay-per-use credits", "85% profit margins"]
    }
  ]

  const useCases = [
    {
      title: "Beauty Salons",
      description: "Automated appointment booking, SMS reminders, and customer follow-ups.",
      metrics: "95% booking accuracy",
      icon: Users
    },
    {
      title: "Dental Offices",
      description: "Patient call handling, appointment scheduling, and recall campaigns.",
      metrics: "90% call answer rate",
      icon: Calendar
    },
    {
      title: "Medical Practices",
      description: "HIPAA-compliant voice AI, patient intake, and automated confirmations.",
      metrics: "80% staff time saved",
      icon: Shield
    },
    {
      title: "Service Businesses",
      description: "Customer service automation, booking management, and CRM integration.",
      metrics: "$127M+ revenue driven",
      icon: TrendingUp
    }
  ]

  const testimonials = [
    {
      name: "Jennifer Martinez",
      role: "Owner, Luxe Beauty Spa",
      content: "VoiceFly handles all our phone calls and bookings. We've increased appointments by 60% and never miss a potential customer anymore.",
      rating: 5
    },
    {
      name: "Dr. Robert Kim",
      role: "Practice Manager, Dental Care Plus",
      content: "The AI voice agent is incredible. Patients think they're talking to a real receptionist. It's saved us thousands in staffing costs.",
      rating: 5
    },
    {
      name: "Marcus Thompson",
      role: "Director, Auto Service Center",
      content: "Best investment we've made. The SMS marketing alone has brought in hundreds of customers. ROI was positive in week one.",
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
              <Link
                href="https://voiceflyai.com"
                target="_blank"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Visit Live Platform
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/10 via-transparent to-blue-600/10 animate-gradient-shift-reverse"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full border border-white/10 mb-6">
                <Phone className="w-4 h-4 text-blue-400 mr-2" />
                <span className="text-sm text-gray-300">Voice AI Platform</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  VoiceFly™
                </span>
                <br />
                <span className="text-white">AI Platform</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl">
                Never miss another customer call. Multi-tenant SaaS platform combining 24/7 AI voice agents, SMS marketing, AI research, and CRM automation for service businesses.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="https://voiceflyai.com"
                  target="_blank"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  <PlayCircle className="mr-2 w-5 h-5" />
                  Try Live Platform
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
                  Schedule Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>

              <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>$99-399/month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>85% margins</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Multi-tenant SaaS</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">VoiceFly™ Live Stats</h3>
                  <p className="text-gray-400 text-sm">Real-time platform metrics</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">Calls Answered Today</span>
                    <span className="text-green-400 font-semibold">4,627</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">SMS Campaigns Active</span>
                    <span className="text-blue-400 font-semibold">1,842</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">Appointments Booked</span>
                    <span className="text-indigo-400 font-semibold">2,391</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">Customer Satisfaction</span>
                    <span className="text-purple-400 font-semibold">98.7%</span>
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
              Complete AI Automation Platform
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              VoiceFly™ combines AI voice agents, SMS marketing, intelligent research, and CRM automation into one powerful multi-tenant platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-black/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-6">
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

      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900/10 to-indigo-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Perfect for Service Businesses
            </h2>
            <p className="text-xl text-gray-400">
              VoiceFly™ powers operations for beauty salons, dental offices, medical practices, and automotive shops
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon
              return (
                <div key={index} className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{useCase.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{useCase.description}</p>
                  <div className="text-xs text-green-400 font-semibold bg-green-400/10 px-3 py-1 rounded-full">
                    {useCase.metrics}
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
              Trusted by Service Businesses
            </h2>
            <p className="text-xl text-gray-400">
              See how VoiceFly™ transforms operations and drives revenue
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

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Customer Service?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join hundreds of service businesses using VoiceFly™ to automate calls, SMS, and customer management. Start today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://voiceflyai.com"
              target="_blank"
              className="px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Visit VoiceFly Platform
            </Link>
            <button className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
              Schedule Personal Demo
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            Multi-tenant SaaS • $99-399/month • Pay-per-use credits • 85% margins
          </p>
        </div>
      </section>
    </div>
  )
}
