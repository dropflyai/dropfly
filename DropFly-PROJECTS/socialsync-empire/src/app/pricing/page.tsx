'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { STRIPE_PLANS } from '@/lib/stripe/config';
import { getStripe } from '@/lib/stripe/client';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planKey: string, priceId: string) => {
    setLoading(planKey);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          planName: planKey,
          billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      await stripe?.redirectToCheckout({ sessionId: data.sessionId });
    } catch (error: any) {
      alert(error.message || 'Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    { key: 'starter', ...STRIPE_PLANS.starter },
    { key: 'creator', ...STRIPE_PLANS.creator },
    { key: 'agency', ...STRIPE_PLANS.agency },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">SocialSync</span>
            </div>
          </Link>

          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            Start free, upgrade when you're ready
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
                  {plan.key === 'starter' && 'Perfect for beginners'}
                  {plan.key === 'creator' && 'For serious creators'}
                  {plan.key === 'agency' && 'For teams & agencies'}
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

                <Button
                  variant={isPopular ? 'primary' : 'outline'}
                  fullWidth
                  size="lg"
                  loading={loading === plan.key}
                  onClick={() => handleSubscribe(plan.key, plan.priceId)}
                >
                  {loading === plan.key ? 'Processing...' : 'Start Free Trial'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-xs text-center text-[var(--text-tertiary)] mt-4">
                  14-day free trial • Cancel anytime
                </p>
              </Card>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-[var(--text-secondary)]">
            All plans include 14-day free trial. No credit card required.
          </p>
          <p className="text-sm text-[var(--text-tertiary)] mt-2">
            Need a custom plan? <a href="mailto:support@socialsync.com" className="text-[var(--primary-500)] hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
}
