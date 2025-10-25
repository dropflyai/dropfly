'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

interface PaywallProps {
  feature: string;
  currentPlan?: string;
  requiredPlan: string;
  usageLimit?: number;
  currentUsage?: number;
  children?: ReactNode;
}

export default function Paywall({
  feature,
  currentPlan = 'free',
  requiredPlan,
  usageLimit,
  currentUsage,
  children,
}: PaywallProps) {
  const isLimitReached = usageLimit !== undefined && currentUsage !== undefined && currentUsage >= usageLimit;
  const shouldShowPaywall = currentPlan === 'free' || isLimitReached;

  if (!shouldShowPaywall && children) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card padding="xl" className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-full flex items-center justify-center">
          {isLimitReached ? (
            <Lock className="w-8 h-8 text-white" />
          ) : (
            <Sparkles className="w-8 h-8 text-white" />
          )}
        </div>

        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          {isLimitReached ? 'Limit Reached' : 'Upgrade to Access'}
        </h3>

        <p className="text-[var(--text-secondary)] mb-6">
          {isLimitReached
            ? `You've reached your ${feature} limit (${currentUsage}/${usageLimit}). Upgrade to ${requiredPlan} plan for more.`
            : `${feature} is available on the ${requiredPlan} plan and above.`}
        </p>

        {isLimitReached && (
          <div className="mb-6 p-4 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg">
            <p className="text-sm text-[var(--warning)]">
              <strong>Current usage:</strong> {currentUsage} / {usageLimit}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/pricing">
            <Button variant="primary" fullWidth size="lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to {requiredPlan}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <Link href="/">
            <Button variant="ghost" fullWidth>
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="text-xs text-[var(--text-tertiary)] mt-6">
          14-day free trial • Cancel anytime
        </p>
      </Card>
    </div>
  );
}
