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
                <Link href="#solutions" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  Solutions
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

      {/* Stats Section */}
      <section className="relative py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-1">200+</div>
              <div className="text-gray-400 text-sm">AI Solutions</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-1">50+</div>
              <div className="text-gray-400 text-sm">Automated Workflows</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent mb-1">1000+</div>
              <div className="text-gray-400 text-sm">Use Cases</div>
            </div>
          </div>
        </div>
      </section>

      {/* Authority Section */}
      <section id="authority" className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              The AI Authority Companies Trust
            </h2>
            <p className="text-base text-gray-400">
              Leading the enterprise AI revolution since day one
            </p>
          </div>

          {/* Authority Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-1">500+</div>
              <div className="text-gray-400 text-xs">Enterprise Clients</div>
              <div className="text-xs text-gray-500 mt-0.5">Fortune 500 & Growing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-1">99.9%</div>
              <div className="text-gray-400 text-xs">Uptime SLA</div>
              <div className="text-xs text-gray-500 mt-0.5">Mission-Critical Reliability</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent mb-1">50M+</div>
              <div className="text-gray-400 text-xs">AI Interactions Daily</div>
              <div className="text-xs text-gray-500 mt-0.5">Processing at Scale</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent mb-1">24/7</div>
              <div className="text-gray-400 text-xs">Expert Support</div>
              <div className="text-xs text-gray-500 mt-0.5">White-Glove Service</div>
            </div>
          </div>

          {/* Industry Recognition */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-xl rounded-xl p-6 border border-white/10 mb-10">
            <h3 className="text-xl font-bold text-white text-center mb-6">Industry Recognition</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg">🏆</span>
                </div>
                <h4 className="font-semibold text-white text-sm">AI Innovation Leader</h4>
                <p className="text-xs text-gray-400 mt-0.5">Gartner Magic Quadrant 2025</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg">⭐</span>
                </div>
                <h4 className="font-semibold text-white text-sm">Best Enterprise AI Platform</h4>
                <p className="text-xs text-gray-400 mt-0.5">TechCrunch Disrupt Winner</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg">🚀</span>
                </div>
                <h4 className="font-semibold text-white text-sm">Fastest Growing AI Company</h4>
                <p className="text-xs text-gray-400 mt-0.5">Inc. 5000 List 2025</p>
              </div>
            </div>
          </div>

          {/* Enterprise Features */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Enterprise Security</h3>
              <p className="text-gray-400 text-xs mb-3">SOC 2 Type II, HIPAA, GDPR compliant with end-to-end encryption</p>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• Zero-trust architecture</li>
                <li>• Multi-tenant isolation</li>
                <li>• Advanced threat detection</li>
              </ul>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Proven Performance</h3>
              <p className="text-gray-400 text-xs mb-3">Battle-tested infrastructure handling billions of requests</p>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• Sub-100ms response times</li>
                <li>• Auto-scaling architecture</li>
                <li>• 99.99% accuracy rates</li>
              </ul>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Expert Partnership</h3>
              <p className="text-gray-400 text-xs mb-3">Dedicated success team with AI PhD specialists</p>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• Custom implementation</li>
                <li>• Strategic consulting</li>
                <li>• 24/7 technical support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stop Managing. Start Scaling.
          </h2>
          <p className="text-base text-gray-300 mb-8">
            Join hundreds of companies using DropFly™ to supercharge their operations with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              Start Free Trial
            </button>
            <button className="px-6 py-3 text-base font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
              Schedule Demo
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