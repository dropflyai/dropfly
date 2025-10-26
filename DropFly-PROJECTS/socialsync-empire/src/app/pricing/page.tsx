'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { STRIPE_PLANS } from '@/lib/stripe/config';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    { key: 'free', ...STRIPE_PLANS.free },
    { key: 'starter', ...STRIPE_PLANS.starter },
    { key: 'pro', ...STRIPE_PLANS.pro },
    { key: 'enterprise', ...STRIPE_PLANS.enterprise },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navigation */}
      <nav className="border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">SocialSync</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">Home</Button>
            </Link>
            <Link href="/features">
              <Button variant="ghost" size="sm">Features</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">Start For Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-20 px-6">
        {/* Header */}
        <div className="text-center mb-12">

          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            Start free, no credit card required
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1 bg-[var(--bg-tertiary)] rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[var(--primary-500)] text-white'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-md transition-all ${
                billingCycle === 'annual'
                  ? 'bg-[var(--primary-500)] text-white'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Annual <span className="ml-1 text-xs">(Save 20%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.monthly : Math.floor(plan.annual / 12);
            const isPopular = plan.popular;

            return (
              <Card
                key={plan.key}
                padding="xl"
                className={isPopular ? 'border-2 border-[var(--primary-500)] relative' : ''}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--primary-500)] text-white text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{plan.name}</h3>
                <p className="text-[var(--text-secondary)] mb-6">
                  {plan.key === 'free' && 'Get started, no credit card'}
                  {plan.key === 'starter' && 'Perfect for beginners'}
                  {plan.key === 'pro' && 'For serious creators'}
                  {plan.key === 'enterprise' && 'For teams & agencies'}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-[var(--text-primary)]">
                    ${price}
                  </span>
                  <span className="text-[var(--text-tertiary)]">/month</span>
                  {billingCycle === 'annual' && (
                    <p className="text-sm text-[var(--success)] mt-1">
                      ${plan.annual}/year (billed annually)
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[var(--text-secondary)]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/signup?plan=${plan.key}`}>
                  <Button
                    variant={isPopular ? 'primary' : 'outline'}
                    fullWidth
                    size="lg"
                  >
                    {plan.key === 'free' ? 'Start For Free' : 'Get Started'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <p className="text-xs text-center text-[var(--text-tertiary)] mt-4">
                  {plan.key === 'free' ? 'No credit card required' : 'Cancel anytime'}
                </p>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <section className="mt-20 py-20 px-6 bg-gradient-to-br from-[var(--primary-500)]/10 to-[var(--secondary-500)]/10 border-2 border-[var(--primary-500)]/20 rounded-2xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--warning)]/20 border border-[var(--warning)]/40 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[var(--warning)]" />
              <span className="text-sm font-bold text-[var(--warning)]">
                Early Access - Limited Spots Available
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
              Ready to Transform Your Social Media?
            </h2>

            <p className="text-xl text-[var(--text-secondary)] mb-8">
              Join early adopters who are already creating viral content with SocialSync.
              <br />
              <strong className="text-[var(--text-primary)]">Start free - no credit card required.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link href="/signup">
                <Button variant="primary" size="lg" className="shadow-lg shadow-[var(--primary-500)]/30">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start For Free
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg">
                  See All Features
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-tertiary)]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Cancel anytime
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Free forever plan
              </div>
            </div>
          </div>
        </section>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-[var(--text-secondary)]">
            Start free forever. Upgrade only when you need more.
          </p>
          <p className="text-sm text-[var(--text-tertiary)] mt-2">
            Need a custom plan? <a href="mailto:support@socialsync.com" className="text-[var(--primary-500)] hover:underline">Contact us</a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[var(--bg-secondary)] border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-[var(--text-primary)]">SocialSync</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                AI-powered social media management for modern creators.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--text-tertiary)]">
            © 2025 SocialSync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
