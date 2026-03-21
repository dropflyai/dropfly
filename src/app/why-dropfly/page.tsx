import Link from 'next/link'
import { Shield, Zap, Users, Brain, Rocket, Award, Clock, Globe, CheckCircle, TrendingUp, Lock, Heart } from 'lucide-react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs"

export default function WhyDropFlyPage() {
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
                DropFly
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
                <Link href="/why-dropfly" className="text-white px-3 py-2 text-sm font-medium">
                  Why DropFly
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
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Why Partner with DropFly
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12">
            In the AI revolution, you need more than just technology. You need a partner who understands your business, delivers results, and evolves with you. That&apos;s DropFly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-lg font-bold text-lg hover:scale-105 transition">
              Schedule Strategic Consultation
            </button>
            <Link href="/products" className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
              Explore Our Solutions
            </Link>
          </div>
        </div>
      </section>

      {/* The AI Era Challenge */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur-xl rounded-2xl border border-red-500/30 p-10 md:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-600/10 to-transparent rounded-bl-full"></div>
            <h2 className="relative text-3xl font-bold text-white mb-10 text-center">
              The AI Era Challenge
            </h2>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">What Companies Face Today</h3>
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <span className="text-red-400 mr-4 text-lg flex-shrink-0">✗</span>
                    <div>
                      <p className="text-sm text-white font-semibold">AI FOMO & Analysis Paralysis</p>
                      <p className="text-gray-400 text-xs">Watching competitors adopt AI while struggling to start</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-4 text-lg flex-shrink-0">✗</span>
                    <div>
                      <p className="text-sm text-white font-semibold">Fragmented Solutions</p>
                      <p className="text-gray-400 text-xs">Multiple AI tools that don&apos;t talk to each other</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-4 text-lg flex-shrink-0">✗</span>
                    <div>
                      <p className="text-sm text-white font-semibold">Hidden Costs & Complexity</p>
                      <p className="text-gray-400 text-xs">Unexpected expenses and technical barriers</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-4 text-lg flex-shrink-0">✗</span>
                    <div>
                      <p className="text-sm text-white font-semibold">Talent Gap</p>
                      <p className="text-gray-400 text-xs">Can&apos;t find or afford AI expertise</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">The DropFly Solution</h3>
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-4 text-lg flex-shrink-0">✓</span>
                    <div>
                      <p className="text-sm text-white font-semibold">Clear AI Roadmap</p>
                      <p className="text-gray-400 text-xs">We map your AI journey from day one to scale</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-4 text-lg flex-shrink-0">✓</span>
                    <div>
                      <p className="text-sm text-white font-semibold">Unified AI Ecosystem</p>
                      <p className="text-gray-400 text-xs">All your AI solutions working in perfect harmony</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-4 text-lg flex-shrink-0">✓</span>
                    <div>
                      <p className="text-sm text-white font-semibold">Transparent, Fixed Pricing</p>
                      <p className="text-gray-400 text-xs">Know exactly what you&apos;ll pay, no surprises</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-4 text-lg flex-shrink-0">✓</span>
                    <div>
                      <p className="text-sm text-white font-semibold">Your AI Team, As-a-Service</p>
                      <p className="text-gray-400 text-xs">PhD-level AI expertise without the hiring</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Unique Approach */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              The DropFly Difference
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We don&apos;t just build AI. We become your AI department.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
              <Brain className="w-12 h-12 text-blue-400 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-4">AI-First Architecture</h3>
              <p className="text-gray-300 mb-4">
                Every solution built from the ground up for AI, not retrofitted. This means 10x better performance and reliability.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Native AI reasoning capabilities</li>
                <li>• Self-improving algorithms</li>
                <li>• Predictive optimization</li>
                <li>• Context-aware processing</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
              <Users className="w-12 h-12 text-purple-400 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-4">White-Glove Partnership</h3>
              <p className="text-gray-300 mb-4">
                You get a dedicated success team that knows your business inside out. We&apos;re not vendors, we&apos;re partners.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Dedicated account strategist</li>
                <li>• Weekly optimization reviews</li>
                <li>• 24/7 priority support</li>
                <li>• Quarterly business reviews</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/50 to-teal-900/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
              <Rocket className="w-12 h-12 text-green-400 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-4">Speed to Value</h3>
              <p className="text-gray-300 mb-4">
                See results in days, not months. Our pre-built AI modules deploy instantly and start delivering ROI immediately.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• 48-hour deployment</li>
                <li>• Week 1 ROI guaranteed</li>
                <li>• No lengthy implementations</li>
                <li>• Instant integrations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Proven Results */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Proven Results That Matter
            </h2>
            <p className="text-xl text-gray-400">
              Real companies. Real results. Real ROI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
                87%
              </div>
              <p className="text-white font-semibold mb-1">Cost Reduction</p>
              <p className="text-gray-400 text-sm">Average operational savings</p>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <p className="text-white font-semibold mb-1">Always On</p>
              <p className="text-gray-400 text-sm">Your AI never sleeps</p>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                10x
              </div>
              <p className="text-white font-semibold mb-1">Productivity Gain</p>
              <p className="text-gray-400 text-sm">Average team efficiency boost</p>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent mb-2">
                48h
              </div>
              <p className="text-white font-semibold mb-1">Time to Deploy</p>
              <p className="text-gray-400 text-sm">From contract to production</p>
            </div>
          </div>

          {/* Case Studies */}
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-xl rounded-xl p-8 border border-white/10">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Law Firm Transformation</h3>
                  <p className="text-gray-300 mb-4">
                    Douglass Hicks Law Firm automated 80% of their case intake process, reduced document processing time by 90%, and increased billable hours by 35% - all within 30 days of deployment.
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-green-400 font-semibold">+$2.3M annual revenue</span>
                    <span className="text-blue-400 font-semibold">-60% admin costs</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Award className="w-16 h-16 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 backdrop-blur-xl rounded-xl p-8 border border-white/10">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Restaurant Revolution</h3>
                  <p className="text-gray-300 mb-4">
                    Mike&apos;s Deli eliminated phone order bottlenecks with Maya Voice Agent, handling 100% of calls, increasing order accuracy to 99.7%, and boosting revenue by 40% during peak hours.
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-green-400 font-semibold">Zero missed orders</span>
                    <span className="text-blue-400 font-semibold">5-star reviews ↑45%</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <TrendingUp className="w-16 h-16 text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Now Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-br from-yellow-900/30 to-orange-900/30 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-10 md:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-600/10 to-transparent rounded-bl-full"></div>
            <h2 className="relative text-3xl font-bold text-white mb-10 text-center">
              Why Companies Choose DropFly Now
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">The AI Window is Closing</h3>
                <p className="text-sm text-gray-300 mb-6">
                  Companies implementing AI today will dominate their industries tomorrow. Those waiting will struggle to catch up. The competitive advantage of early AI adoption compounds daily.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Clock className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-white font-semibold">First-Mover Advantage</p>
                      <p className="text-gray-400 text-xs">Lock in market position before competitors</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Globe className="w-6 h-6 text-orange-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-white font-semibold">Global Scale Ready</p>
                      <p className="text-gray-400 text-xs">AI that grows with your ambitions</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-6">DropFly&apos;s Unique Position</h3>
                <p className="text-sm text-gray-300 mb-6">
                  We&apos;ve spent years perfecting AI solutions that actually work in the real world. Our battle-tested platform powers companies from startups to Fortune 500s.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Shield className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-white font-semibold">Enterprise-Grade Security</p>
                      <p className="text-gray-400 text-xs">SOC 2, HIPAA, GDPR compliant from day one</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Heart className="w-6 h-6 text-pink-400 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-white font-semibold">Human-Centric AI</p>
                      <p className="text-gray-400 text-xs">Augments your team, doesn&apos;t replace them</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our Commitment to Your Success
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              When you partner with DropFly, you get more than AI. You get a promise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <CheckCircle className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">ROI Guarantee</h3>
              <p className="text-gray-400 text-sm">
                See measurable ROI within 30 days or we work for free until you do
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <Lock className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Data Sovereignty</h3>
              <p className="text-gray-400 text-sm">
                Your data stays yours. Complete ownership, portability, and control
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <Zap className="w-10 h-10 text-yellow-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Continuous Innovation</h3>
              <p className="text-gray-400 text-sm">
                Get new AI capabilities automatically as we develop them - no extra cost
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <Users className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Success Partnership</h3>
              <p className="text-gray-400 text-sm">
                Dedicated team working as an extension of your organization
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Future Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-pink-900/30 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-10 md:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/10 to-transparent rounded-bl-full"></div>
            <h2 className="relative text-3xl font-bold text-white mb-10 text-center">
              Building Tomorrow, Today
            </h2>
            
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-base text-gray-300 mb-8">
                The companies that will lead the next decade are being built right now. They&apos;re the ones embracing AI not as a tool, but as a transformation. They&apos;re not asking &quot;if&quot; they should adopt AI, but &quot;how fast&quot; they can.
              </p>
              
              <p className="text-base text-white font-semibold mb-8">
                DropFly is their partner. We should be yours too.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    2025
                  </div>
                  <p className="text-gray-400">The year AI becomes mandatory</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    500+
                  </div>
                  <p className="text-gray-400">Companies already ahead with DropFly</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent mb-2">
                    ∞
                  </div>
                  <p className="text-gray-400">Your potential with AI</p>
                </div>
              </div>

              <p className="text-base text-gray-300 italic">
                &quot;The best time to plant a tree was 20 years ago. The second best time is now.&quot;
                <br />
                <span className="text-sm">- Ancient Proverb, Modern Truth</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Lead Your Industry?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join the companies already transforming with DropFly&apos;s AI solutions
          </p>
          
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-xl p-8 border border-yellow-500/30 mb-8">
            <p className="text-2xl font-semibold text-white mb-4">
              Limited Spots Available for Q1 2025 Onboarding
            </p>
            <p className="text-gray-300">
              We only partner with companies ready to lead. Is that you?
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-lg font-bold text-xl hover:scale-105 transition shadow-2xl">
              Claim Your AI Advantage Now
            </button>
            <Link href="/products" className="px-10 py-5 text-xl font-medium text-white border-2 border-white/30 rounded-lg hover:bg-white/10 transition-all">
              Explore Our Solutions
            </Link>
          </div>

          <p className="text-sm text-gray-400 mt-8">
            No commitment required. 30-minute strategic consultation. ROI roadmap included.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/50 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">DropFly</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Your AI transformation partner. Building intelligent solutions that evolve with your business.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link href="/products/maya" className="hover:text-white transition-colors">Maya Voice Agent</Link></li>
                <li><Link href="https://leadflyai.com" target="_blank" className="hover:text-white transition-colors">LeadFly AI</Link></li>
                <li><Link href="/products/lawfly" className="hover:text-white transition-colors">LawFly Pro</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/why-dropfly" className="hover:text-white transition-colors">Why DropFly</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 DropFly. All rights reserved. | Building the future of business with AI.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}