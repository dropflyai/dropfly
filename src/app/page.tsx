import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-light text-gray-800">DropFly</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link href="#features" className="text-gray-600 hover:text-gray-800 px-3 py-2 text-sm font-light transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="text-gray-600 hover:text-gray-800 px-3 py-2 text-sm font-light transition-colors">
                  Pricing
                </Link>
                <Link href="#about" className="text-gray-600 hover:text-gray-800 px-3 py-2 text-sm font-light transition-colors">
                  About
                </Link>
                <button className="bg-gray-800 text-white px-6 py-2 rounded-sm text-sm font-normal hover:bg-gray-700 transition-colors ml-4">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-light text-gray-800 mb-6 tracking-tight">
              Build Stunning Apps
              <span className="block text-gray-600 font-light">With DropFly</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              The professional app builder designed for developers who demand elegance, performance, and simplicity. Create beautiful applications with our clean, minimal interface.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gray-800 text-white px-8 py-4 rounded-sm text-lg font-normal hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                Start Building Free
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="bg-white text-gray-800 border border-gray-300 px-8 py-4 rounded-sm text-lg font-normal hover:bg-gray-50 transition-colors">
                View Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-800 mb-4 tracking-tight">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              Professional tools and features designed for modern development workflows
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-sm border border-gray-100 p-8 text-center hover:shadow-sm transition-all duration-300">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-normal text-gray-800 mb-4">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Built with performance in mind. Create and deploy applications in seconds, not hours.
              </p>
            </div>

            <div className="bg-white rounded-sm border border-gray-100 p-8 text-center hover:shadow-sm transition-all duration-300">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-normal text-gray-800 mb-4">Beautiful Design</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Clean, minimal interface inspired by the best design systems. Your apps will look professional from day one.
              </p>
            </div>

            <div className="bg-white rounded-sm border border-gray-100 p-8 text-center hover:shadow-sm transition-all duration-300">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-normal text-gray-800 mb-4">Enterprise Ready</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Security, scalability, and reliability built in. Trusted by teams building mission-critical applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-light text-gray-800 mb-6 tracking-tight">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-xl text-gray-600 mb-12 font-light">
            Join thousands of developers who trust DropFly for their most important projects
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input 
              placeholder="Enter your email address" 
              className="sm:w-80 text-lg py-4 px-4 border border-gray-300 rounded-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 focus:outline-none font-light text-gray-900 placeholder-gray-500"
              type="email"
            />
            <button className="text-lg px-8 py-4 bg-gray-800 text-white hover:bg-gray-700 rounded-sm font-normal transition-colors">
              Get Started Free
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4 font-light">
            No credit card required • 14-day free trial
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <h3 className="text-2xl font-light text-gray-800 mb-4">DropFly</h3>
              <p className="text-gray-600 mb-6 max-w-md font-light">
                The professional app builder for developers who demand the best. Clean design, powerful features, unlimited possibilities.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.887 2.747.099.120.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.017.001z.017 0"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-normal text-gray-800 mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-800 transition-colors font-light">Features</a></li>
                <li><a href="#" className="hover:text-gray-800 transition-colors font-light">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-800 transition-colors font-light">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-800 transition-colors font-light">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-normal text-gray-800 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-800 transition-colors font-light">About</a></li>
                <li><a href="#" className="hover:text-gray-800 transition-colors font-light">Blog</a></li>
                <li><a href="#" className="hover:text-gray-800 transition-colors font-light">Careers</a></li>
                <li><a href="#" className="hover:text-gray-800 transition-colors font-light">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-500">
            <p className="font-light">&copy; 2024 DropFly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}