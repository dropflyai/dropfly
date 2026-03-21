import Link from 'next/link'
import type { Metadata } from "next"
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs"

export const metadata: Metadata = {
  title: "Terms of Service - DropFly AI",
  description: "DropFly AI Terms of Service",
}

export default function TermsPage() {
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
              <Link href="/">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">DropFly&trade;</h1>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                <Link href="/products" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Products</Link>
                <Link href="/ai-insights" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">The Edge</Link>
                <Link href="/why-dropfly" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Why DropFly&trade;</Link>
                <SignedOut>
                  <SignInButton>
                    <button className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Sign In</button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all ml-4">Get Started</button>
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

      {/* Header */}
      <section className="relative pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Terms of Service
            </span>
          </h1>
          <p className="text-sm text-gray-400">Last updated: March 21, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="relative pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 md:p-8 border border-white/10 space-y-8">

            <div>
              <h2 className="text-base font-semibold text-white mb-2">1. Acceptance of Terms</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                By accessing or using DropFly AI&apos;s services, including SocialFly, VoiceFly, TaxFly,
                and any related products (collectively, the &quot;Services&quot;), you agree to be bound by
                these Terms of Service. If you do not agree, do not use the Services.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">2. Description of Services</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                DropFly AI provides AI-powered business tools including social media management,
                AI phone agents, tax preparation assistance, and related automation services.
                Services may use artificial intelligence to generate content, images, and other outputs.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">3. User Accounts</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                You are responsible for maintaining the security of your account credentials.
                You must provide accurate information when creating an account. You are responsible
                for all activity that occurs under your account.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">4. Acceptable Use</h2>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">You agree not to:</p>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>&#8226; Use the Services for any unlawful purpose</li>
                <li>&#8226; Generate or distribute harmful, misleading, or inappropriate content</li>
                <li>&#8226; Attempt to gain unauthorized access to any part of the Services</li>
                <li>&#8226; Interfere with or disrupt the Services</li>
                <li>&#8226; Violate any third-party platform&apos;s terms of service when posting content</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">5. AI-Generated Content</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Content generated by our AI tools is provided as-is. You are responsible for
                reviewing and approving all AI-generated content before publishing. DropFly AI
                does not guarantee the accuracy, appropriateness, or effectiveness of AI-generated content.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">6. Third-Party Integrations</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Our Services integrate with third-party platforms including Instagram, TikTok,
                Twitter/X, and others. Your use of these integrations is subject to those
                platforms&apos; respective terms of service. DropFly AI is not responsible for
                actions taken by third-party platforms.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">7. Payment and Billing</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Paid features are billed on a subscription basis. You may cancel at any time.
                Refunds are handled on a case-by-case basis. Prices are subject to change
                with reasonable notice.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">8. Intellectual Property</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                You retain ownership of content you create using our Services. You grant
                DropFly AI a limited license to process your content as necessary to provide
                the Services. DropFly AI retains all rights to the Services, software, and technology.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">9. Limitation of Liability</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                DropFly AI provides the Services &quot;as is&quot; without warranties of any kind.
                To the maximum extent permitted by law, DropFly AI shall not be liable for
                any indirect, incidental, special, or consequential damages.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">10. Changes to Terms</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                We may update these Terms from time to time. We will notify users of material
                changes. Continued use of the Services after changes constitutes acceptance
                of the updated Terms.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">11. Contact</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                For questions about these Terms, contact us at{" "}
                <a href="mailto:support@dropflyai.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                  support@dropflyai.com
                </a>
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/50 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="col-span-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-3">DropFly&trade;</h3>
              <p className="text-gray-400 text-sm mb-4 max-w-md">
                Building AI teams for every department, so you scale faster, cut costs, and never miss an opportunity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Products</h4>
              <ul className="space-y-1.5 text-gray-400 text-xs">
                <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link href="/products/maya" className="hover:text-white transition-colors">Maya&trade; AI Assistant</Link></li>
                <li><Link href="/products/lawfly" className="hover:text-white transition-colors">LawFly&trade; Pro</Link></li>
                <li><Link href="/products/homefly" className="hover:text-white transition-colors">HomeFly&trade;</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Company</h4>
              <ul className="space-y-1.5 text-gray-400 text-xs">
                <li><Link href="/why-dropfly" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/ai-insights" className="hover:text-white transition-colors">The Edge</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-6 pt-6 text-center text-gray-400 text-xs">
            <p>&copy; 2026 DropFly&trade;. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
