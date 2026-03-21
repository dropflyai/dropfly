'use client'

import Link from 'next/link'
import { 
  Phone, 
  Brain, 
  Clock, 
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Star,
  BarChart3,
  Settings,
  Mail,
  Calendar,
  Database
} from 'lucide-react'

export default function MayaPage() {
  const features = [
    {
      icon: Brain,
      title: "Intelligent Task Automation",
      description: "Advanced AI that learns your business processes and automates repetitive tasks with human-level accuracy.",
      benefits: ["Smart decision making", "Process optimization", "Continuous learning"]
    },
    {
      icon: Clock,
      title: "Always-On Assistant",
      description: "Maya™ never sleeps, never takes breaks, and never misses a deadline. Your most reliable team member.",
      benefits: ["24/7 operation", "No sick days", "Consistent performance"]
    },
    {
      icon: Settings,
      title: "Universal Integration",
      description: "Connects to any system you use - CRM, email, calendar, databases, and custom applications.",
      benefits: ["500+ integrations", "Real-time sync", "Custom workflows"]
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track productivity gains, ROI metrics, and optimization opportunities across all automated tasks.",
      benefits: ["ROI tracking", "Productivity metrics", "Optimization insights"]
    }
  ]

  const useCases = [
    {
      title: "Phone & Communication",
      description: "Handle all phone calls, take messages, schedule appointments, and follow up automatically.",
      metrics: "90% reduction in missed opportunities",
      icon: Phone
    },
    {
      title: "Email Management",
      description: "Sort, prioritize, respond to emails automatically and keep your inbox organized.",
      metrics: "5 hours saved per day on email",
      icon: Mail
    },
    {
      title: "Calendar & Scheduling",
      description: "Manage calendars, book appointments, send reminders, and coordinate meetings seamlessly.",
      metrics: "95% booking accuracy rate",
      icon: Calendar
    },
    {
      title: "Data Entry & CRM",
      description: "Automatically update databases, manage customer records, and maintain data accuracy.",
      metrics: "99.8% data accuracy rate",
      icon: Database
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "VP of Operations, TechStart Inc.",
      content: "Maya™ has transformed our customer service. We've reduced response times by 90% and customer satisfaction is at an all-time high.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "CEO, Local Restaurant Group", 
      content: "Since implementing Maya™, we've increased our phone orders by 150%. It's like having our best employee available 24/7.",
      rating: 5
    },
    {
      name: "Lisa Rodriguez",
      role: "Customer Success Manager, SaaS Pro",
      content: "The AI understands our customers better than some of our human agents. The integration was seamless and ROI was immediate.",
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
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
                Get Demo
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-green-600/10 via-transparent to-blue-600/10 animate-gradient-shift-reverse"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full border border-white/10 mb-6">
                <Phone className="w-4 h-4 text-blue-400 mr-2" />
                <span className="text-sm text-gray-300">AI Assistant</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Maya™
                </span>
                <br />
                <span className="text-white">AI Assistant</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl">
                Your personal AI assistant that never sleeps. Handles phone calls, schedules appointments, manages emails, processes data, and automates your daily tasks - so you can focus on what matters most.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
                  <PlayCircle className="mr-2 w-5 h-5" />
                  Watch Demo
                </button>
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>30-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Maya™ is Live</h3>
                  <p className="text-gray-400 text-sm">Automating tasks across all businesses</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">Tasks Automated Today</span>
                    <span className="text-green-400 font-semibold">2,847</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">Emails Processed</span>
                    <span className="text-blue-400 font-semibold">1,204</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">Appointments Booked</span>
                    <span className="text-purple-400 font-semibold">389</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300 text-sm">Time Saved (Hours)</span>
                    <span className="text-pink-400 font-semibold">14,623</span>
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
              Your AI Assistant That Does Everything
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Maya™ doesn&apos;t just handle one task — she automates your entire workflow. Phone calls, emails, scheduling, data entry, and more.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-black/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-6">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900/10 to-purple-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Stop Doing These Tasks Yourself
            </h2>
            <p className="text-xl text-gray-400">
              Maya™ handles the tasks that eat up your day, so you can focus on growing your business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon
              return (
                <div key={index} className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
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
              Loved by Businesses Worldwide
            </h2>
            <p className="text-xl text-gray-400">
              See what our customers say about Maya™&apos;s impact on their business
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Stop Wasting Time on Repetitive Tasks
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Get Maya™ and reclaim hours of your day. Start automating everything today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              Start Your Free Trial
            </button>
            <button className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
              Schedule Personal Demo
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            No credit card required • 30-day free trial • Setup in under 5 minutes
          </p>
        </div>
      </section>
    </div>
  )
}