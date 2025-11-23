import Link from 'next/link'
import { ArrowRight, Zap, Shield, Code, Cpu, Users, FileCheck } from 'lucide-react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient-shift"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-green-600/10 via-transparent to-blue-600/10 animate-gradient-shift-reverse"></div>
      
      {/* Navigation */}
      <nav className="relative bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">DropFly™</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                <Link href="/products" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  Products
                </Link>
                <Link href="/ai-insights" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  The Edge
                </Link>
                <Link href="/why-dropfly" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  Why DropFly™
                </Link>
                <Link href="#about" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  About
                </Link>
                <SignedOut>
                  <SignInButton>
                    <button className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all ml-4">
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
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Imagine Your Business.
            </span>
            <br />
            <span className="text-white">Supercharged by AI.</span>
          </h1>
          <p className="text-base md:text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
            Dropfly builds AI teams for every department, so you scale faster, cut costs, and never miss an opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              Explore Products
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <button className="px-6 py-3 text-base font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section id="solutions" className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              AI Solutions for Every Department
            </h2>
            <p className="text-base text-gray-400 max-w-2xl mx-auto">
              Custom AI agents that integrate seamlessly with your existing tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Voice Agents</h3>
              <p className="text-gray-400 text-xs">24/7 intelligent voice support</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                <FileCheck className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Content Creation</h3>
              <p className="text-gray-400 text-xs">Automated content generation</p>
            </div>

            <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Medical Intake AI</h3>
              <p className="text-gray-400 text-xs">HIPAA-compliant processing</p>
            </div>

            <div className="bg-gradient-to-br from-pink-900/50 to-orange-900/50 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Predictive Sales AI</h3>
              <p className="text-gray-400 text-xs">AI-powered sales insights</p>
            </div>

            <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mb-3">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">CRM/API Integration</h3>
              <p className="text-gray-400 text-xs">Seamless system connections</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/50 to-blue-900/50 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">HR Automation</h3>
              <p className="text-gray-400 text-xs">Streamline HR processes</p>
            </div>

            <div className="bg-gradient-to-br from-red-900/50 to-purple-900/50 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Security & Compliance</h3>
              <p className="text-gray-400 text-xs">Enterprise-grade protection</p>
            </div>

            <div className="bg-gradient-to-br from-teal-900/50 to-green-900/50 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center mb-3">
                <FileCheck className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Document Processing</h3>
              <p className="text-gray-400 text-xs">Intelligent document AI</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              How We Build Your AI Team
            </h2>
            <p className="text-base text-gray-400">
              From consultation to scale, we handle everything
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-white">1</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Consult & Plan</h3>
              <p className="text-gray-400 text-xs">We learn your business and custom map your needs</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-white">2</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Build & Launch</h3>
              <p className="text-gray-400 text-xs">Tailored AI systems built, integrated and deployed</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-white">3</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Monitor & Optimize</h3>
              <p className="text-gray-400 text-xs">Real-time monitoring. Continuously improving</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-white">4</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Scale & Expand</h3>
              <p className="text-gray-400 text-xs">Add new solutions as you grow</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Technology & Insights Section */}
      <section id="ai-insights" className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Why We're Your AI Implementation Partner
            </h2>
            <p className="text-base text-gray-400 max-w-3xl mx-auto">
              We build production-ready AI systems using cutting-edge technologies. Here's what sets us apart and what you need to know about modern AI.
            </p>
          </div>

          {/* Business Value */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Scale Revenue Without Hiring</h3>
              <p className="text-gray-400 text-xs mb-3">AI agents handle customer interactions, lead qualification, and sales 24/7</p>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• Never miss a lead or customer call</li>
                <li>• Handle 10x the volume with same team</li>
                <li>• Response times under 1 second</li>
                <li>• Works nights, weekends, holidays</li>
              </ul>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Free Your Team for High-Value Work</h3>
              <p className="text-gray-400 text-xs mb-3">Automate repetitive tasks so your team focuses on growth</p>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• Automated data entry and research</li>
                <li>• Intelligent document processing</li>
                <li>• Customer support triage</li>
                <li>• Marketing content generation</li>
              </ul>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Reduce Costs Dramatically</h3>
              <p className="text-gray-400 text-xs mb-3">AI costs pennies compared to hiring and training staff</p>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• 90%+ cost reduction vs. hiring</li>
                <li>• No training, onboarding, or benefits</li>
                <li>• Scales instantly with demand</li>
                <li>• Consistent quality, zero turnover</li>
              </ul>
            </div>
          </div>

          {/* The Edge - AI Intelligence Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-purple-500 via-blue-500 to-cyan-500 rounded-full"></div>
                <h3 className="text-lg font-bold text-white">The Edge</h3>
              </div>
              <Link href="/ai-insights" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 group">
                View all
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Featured Section */}
            <div className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 text-[10px] font-bold text-yellow-300 bg-yellow-600/30 rounded border border-yellow-500/30">
                  FEATURED
                </span>
                <span className="text-xs text-gray-400">Latest AI Intelligence</span>
              </div>

              {/* Featured Articles Grid */}
              <div className="grid grid-cols-3 gap-3">
              {/* Featured Article 1 */}
              <Link href="/ai-insights/1" className="group relative block overflow-hidden rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>

                {/* Content */}
                <div className="relative bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-pink-900/30 backdrop-blur-sm p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-1.5 py-0.5 text-[10px] font-bold text-purple-200 bg-purple-600/50 rounded">AI Agents</span>
                    <span className="text-[10px] text-gray-500">8 min</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1 group-hover:text-purple-400 transition-colors line-clamp-2">
                    The Agentic AI Revolution: Why 2025 is the Year AI Agents Go Mainstream
                  </h4>
                  <p className="text-[10px] text-gray-400 leading-snug line-clamp-2">
                    AI agents that can plan and execute complex tasks autonomously are moving from research labs to production.
                  </p>
                </div>
              </Link>

              {/* Featured Article 2 */}
              <Link href="/ai-insights/2" className="group relative block overflow-hidden rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>

                {/* Content */}
                <div className="relative bg-gradient-to-br from-blue-900/30 via-indigo-900/30 to-purple-900/30 backdrop-blur-sm p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-1.5 py-0.5 text-[10px] font-bold text-blue-200 bg-blue-600/50 rounded">Voice AI</span>
                    <span className="text-[10px] text-gray-500">6 min</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                    Voice AI Is Eating Traditional Call Centers: A Cost Analysis
                  </h4>
                  <p className="text-[10px] text-gray-400 leading-snug line-clamp-2">
                    New voice AI systems achieve 95%+ accuracy. A single AI agent costs $3,600/year vs $50,000+ for humans.
                  </p>
                </div>
              </Link>

              {/* Featured Article 3 */}
              <Link href="/ai-insights/3" className="group relative block overflow-hidden rounded-lg border border-green-500/30 hover:border-green-400/50 transition-all">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-emerald-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>

                {/* Content */}
                <div className="relative bg-gradient-to-br from-green-900/30 via-emerald-900/30 to-teal-900/30 backdrop-blur-sm p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-1.5 py-0.5 text-[10px] font-bold text-green-200 bg-green-600/50 rounded">AI Models</span>
                    <span className="text-[10px] text-gray-500">7 min</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1 group-hover:text-green-400 transition-colors line-clamp-2">
                    DeepSeek-R1 and the Open Model Revolution: Enterprise AI at 98% Lower Cost
                  </h4>
                  <p className="text-[10px] text-gray-400 leading-snug line-clamp-2">
                    Chinese AI startup DeepSeek released a reasoning model matching GPT-4 at 2% of the cost.
                  </p>
                </div>
              </Link>
              </div>
            </div>

            {/* View More Button */}
            <Link
              href="/ai-insights"
              className="block w-full text-center px-3 py-2 text-xs font-medium text-white bg-black/30 border border-white/10 rounded hover:bg-black/50 hover:border-white/20 transition-all"
            >
              View All Edge Articles →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Build Your AI Solution?
          </h2>
          <p className="text-base text-gray-300 mb-8">
            Let's talk about your specific needs and build something custom for your business
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products" className="px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              Explore Our Products
            </Link>
            <button className="px-6 py-3 text-base font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
              Schedule a Call
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/50 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="col-span-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-3">DropFly™</h3>
              <p className="text-gray-400 text-sm mb-4 max-w-md">
                Building AI teams for every department, so you scale faster, cut costs, and never miss an opportunity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Products</h4>
              <ul className="space-y-1.5 text-gray-400 text-xs">
                <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link href="/products/maya" className="hover:text-white transition-colors">Maya™ AI Assistant</Link></li>
                <li><Link href="https://leadflyai.com" target="_blank" className="hover:text-white transition-colors">LeadFly AI</Link></li>
                <li><Link href="/products/lawfly" className="hover:text-white transition-colors">LawFly™ Pro</Link></li>
                <li><Link href="/products/homefly" className="hover:text-white transition-colors">HomeFly™</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Company</h4>
              <ul className="space-y-1.5 text-gray-400 text-xs">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-6 pt-6 text-center text-gray-400 text-xs">
            <p>&copy; 2025 DropFly™. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}