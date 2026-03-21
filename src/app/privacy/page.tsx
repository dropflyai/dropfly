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
  title: "Privacy Policy - DropFly AI",
  description: "DropFly AI Privacy Policy",
}

export default function PrivacyPage() {
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
              Privacy Policy
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
              <h2 className="text-base font-semibold text-white mb-2">1. Introduction</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                DropFly Inc. (&quot;DropFly AI,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates
                the DropFly AI platform and its products including SocialFly, VoiceFly, and TaxFly.
                This Privacy Policy describes how we collect, use, and protect your information.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">2. Information We Collect</h2>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">We collect information you provide directly:</p>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>&#8226; Account information (name, email address)</li>
                <li>&#8226; Social media account connections and tokens</li>
                <li>&#8226; Content you create or generate using our Services</li>
                <li>&#8226; Payment information (processed securely by Stripe)</li>
                <li>&#8226; Communications with us</li>
              </ul>
              <p className="text-xs text-gray-400 leading-relaxed mt-3 mb-2">We automatically collect:</p>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>&#8226; Usage data and analytics</li>
                <li>&#8226; Device and browser information</li>
                <li>&#8226; Log data</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">3. How We Use Your Information</h2>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>&#8226; To provide and maintain our Services</li>
                <li>&#8226; To generate and publish content on your behalf</li>
                <li>&#8226; To connect to your social media accounts as authorized by you</li>
                <li>&#8226; To process payments</li>
                <li>&#8226; To communicate with you about the Services</li>
                <li>&#8226; To improve our Services and develop new features</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">4. Third-Party Services</h2>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">Our Services integrate with third-party platforms including:</p>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>&#8226; <span className="text-gray-300 font-medium">Instagram/Meta</span> &mdash; to publish content to your Instagram account</li>
                <li>&#8226; <span className="text-gray-300 font-medium">TikTok</span> &mdash; to publish content to your TikTok account</li>
                <li>&#8226; <span className="text-gray-300 font-medium">Twitter/X</span> &mdash; to publish content to your Twitter account</li>
                <li>&#8226; <span className="text-gray-300 font-medium">Stripe</span> &mdash; to process payments securely</li>
                <li>&#8226; <span className="text-gray-300 font-medium">Anthropic (Claude AI)</span> &mdash; to generate content</li>
                <li>&#8226; <span className="text-gray-300 font-medium">FAL.ai</span> &mdash; to generate images</li>
              </ul>
              <p className="text-xs text-gray-400 leading-relaxed mt-3">
                When you connect a social media account, we store OAuth tokens securely to
                post on your behalf. You can disconnect any platform at any time through
                your account settings.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">5. Data Storage and Security</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Your data is stored securely using industry-standard encryption for data in transit and at rest.
                We implement row-level security policies to ensure your data is only accessible to you.
                OAuth tokens are stored securely and refreshed automatically.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">6. Data Retention</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                We retain your data for as long as your account is active. When you delete
                your account, we will delete your personal data within 30 days, except where
                required by law.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">7. Your Rights</h2>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">You have the right to:</p>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>&#8226; Access your personal data</li>
                <li>&#8226; Correct inaccurate data</li>
                <li>&#8226; Delete your account and data</li>
                <li>&#8226; Disconnect social media accounts at any time</li>
                <li>&#8226; Export your data</li>
                <li>&#8226; Opt out of marketing communications</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">8. Children&apos;s Privacy</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Our Services are not intended for children under 13. We do not knowingly
                collect personal information from children under 13.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">9. Changes to This Policy</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of
                material changes by posting the updated policy on our website.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-2">10. Contact Us</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                For questions about this Privacy Policy or your data, contact us at{" "}
                <a href="mailto:privacy@dropflyai.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                  privacy@dropflyai.com
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
