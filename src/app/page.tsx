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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">DropFly</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link href="/products" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  Products
                </Link>
                <Link href="#solutions" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  Solutions
                </Link>
                <Link href="#expertise" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  Expertise
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
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Imagine Your Business.
            </span>
            <br />
            <span className="text-white">Supercharged by AI.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Dropfly builds AI teams for every department, so you scale faster, cut costs, and never miss an opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              Explore Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section id="solutions" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              AI Solutions for Every Department
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Custom AI agents that integrate seamlessly with your existing tools
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Voice Agents</h3>
              <p className="text-gray-400 text-sm">24/7 intelligent voice support</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Content Creation</h3>
              <p className="text-gray-400 text-sm">Automated content generation</p>
            </div>

            <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Medical Intake AI</h3>
              <p className="text-gray-400 text-sm">HIPAA-compliant processing</p>
            </div>

            <div className="bg-gradient-to-br from-pink-900/50 to-orange-900/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Predictive Sales AI</h3>
              <p className="text-gray-400 text-sm">AI-powered sales insights</p>
            </div>

            <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">CRM/API Integration</h3>
              <p className="text-gray-400 text-sm">Seamless system connections</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/50 to-blue-900/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">HR Automation</h3>
              <p className="text-gray-400 text-sm">Streamline HR processes</p>
            </div>

            <div className="bg-gradient-to-br from-red-900/50 to-purple-900/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Security & Compliance</h3>
              <p className="text-gray-400 text-sm">Enterprise-grade protection</p>
            </div>

            <div className="bg-gradient-to-br from-teal-900/50 to-green-900/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Document Processing</h3>
              <p className="text-gray-400 text-sm">Intelligent document AI</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How We Build Your AI Team
            </h2>
            <p className="text-xl text-gray-400">
              From consultation to scale, we handle everything
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Consult & Plan</h3>
              <p className="text-gray-400 text-sm">We learn your business and custom map your needs</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Build & Launch</h3>
              <p className="text-gray-400 text-sm">Tailored AI systems built, integrated and deployed</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Monitor & Optimize</h3>
              <p className="text-gray-400 text-sm">Real-time monitoring. Continuously improving</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Scale & Expand</h3>
              <p className="text-gray-400 text-sm">Add new solutions as you grow</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">200+</div>
              <div className="text-gray-400">AI Solutions</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">50+</div>
              <div className="text-gray-400">Automated Workflows</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent mb-2">1000+</div>
              <div className="text-gray-400">Use Cases</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Authority Section */}
      <section id="expertise" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              The Science Behind the Magic
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              While others talk about AI, we&apos;ve been quietly building the future. Here&apos;s what happens when you combine 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> deep learning expertise</span> with 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> real-world obsession</span>.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Achievement Cards */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-indigo-900/30 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Neural Architecture</h3>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                <p className="text-gray-300 mb-6">
                  Our models don&apos;t just process data—they understand context, intent, and nuance like a senior analyst with 20 years of experience.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">99.7%</div>
                    <div className="text-sm text-gray-400">Accuracy Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">&lt;100ms</div>
                    <div className="text-sm text-gray-400">Response Time</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-rose-900/30 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Continuous Evolution</h3>
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                </div>
                <p className="text-gray-300 mb-6">
                  Every interaction teaches our systems something new. It&apos;s like having an employee who gets exponentially smarter every day.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">24/7</div>
                    <div className="text-sm text-gray-400">Learning Mode</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">∞</div>
                    <div className="text-sm text-gray-400">Scalability</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Philosophy */}
            <div className="space-y-8">
              <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <h3 className="text-3xl font-bold text-white mb-6">Our Philosophy</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Intelligence Over Automation</h4>
                      <p className="text-gray-400 text-sm">Anyone can automate. We build AI that actually thinks.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Context is Everything</h4>
                      <p className="text-gray-400 text-sm">Our AI doesn&apos;t just follow scripts—it understands your business.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Humans + AI = Unstoppable</h4>
                      <p className="text-gray-400 text-sm">We don&apos;t replace humans. We make them superhuman.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 relative">
                <div className="absolute -top-3 -left-3 text-6xl text-blue-400/20 font-serif">&ldquo;</div>
                <p className="text-lg text-gray-300 italic mb-4 relative z-10">
                  The best AI is invisible. It just makes everything work better, faster, smarter—like having a genius-level assistant who never sleeps.
                </p>
                <div className="text-sm text-gray-400">— The DropFly Manifesto</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Stop Managing. Start Scaling.
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join hundreds of companies using DropFly to supercharge their operations with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              Start Free Trial
            </button>
            <button className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/50 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">DropFly</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Building AI teams for every department, so you scale faster, cut costs, and never miss an opportunity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link href="/products#maya" className="hover:text-white transition-colors">Maya Voice Agent</Link></li>
                <li><Link href="https://leadflyai.com" className="hover:text-white transition-colors">LeadFly AI</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DropFly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}