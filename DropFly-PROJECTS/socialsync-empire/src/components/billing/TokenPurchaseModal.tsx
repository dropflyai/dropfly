'use client';

import { useState } from 'react';
import { Coins, X, Sparkles, Zap } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance?: number;
}

// Token packages with bonuses
const TOKEN_PACKAGES = [
  {
    id: 'starter',
    tokens: 1000,
    price: 10,
    bonus: 0,
    popular: false,
    description: 'Perfect for testing',
  },
  {
    id: 'popular',
    tokens: 5000,
    price: 45,
    bonus: 500,
    popular: true,
    description: 'Most popular choice',
  },
  {
    id: 'pro',
    tokens: 10000,
    price: 80,
    bonus: 2000,
    popular: false,
    description: 'Best value',
  },
  {
    id: 'enterprise',
    tokens: 25000,
    price: 180,
    bonus: 7500,
    popular: false,
    description: 'Maximum savings',
  },
];

export function TokenPurchaseModal({
  isOpen,
  onClose,
  currentBalance = 0,
}: TokenPurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState(TOKEN_PACKAGES[1].id);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    const pkg = TOKEN_PACKAGES.find((p) => p.id === selectedPackage);
    if (!pkg) return;

    setIsLoading(true);

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'token_purchase',
          tokenAmount: pkg.tokens + pkg.bonus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout');
      setIsLoading(false);
    }
  };

  const selectedPkg = TOKEN_PACKAGES.find((p) => p.id === selectedPackage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card variant="glass" padding="lg" className="w-full max-w-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)]">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] bg-clip-text text-transparent">
              Buy Tokens
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Current balance: {currentBalance.toLocaleString()} tokens
            </p>
          </div>
        </div>

        {/* Token packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {TOKEN_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              disabled={isLoading}
              className={`
                relative p-4 rounded-xl border-2 transition-all text-left
                ${
                  selectedPackage === pkg.id
                    ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/10'
                    : 'border-[var(--border)] hover:border-[var(--primary-500)]/50'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Popular badge */}
              {pkg.popular && (
                <div className="absolute -top-2 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-[var(--warning)] to-[var(--secondary-500)] text-xs font-bold text-white">
                  POPULAR
                </div>
              )}

              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-2xl font-bold">
                    {(pkg.tokens + pkg.bonus).toLocaleString()}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {pkg.description}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[var(--primary-500)]">
                    ${pkg.price}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    ${(pkg.price / (pkg.tokens + pkg.bonus) * 100).toFixed(2)}/1K
                  </div>
                </div>
              </div>

              {pkg.bonus > 0 && (
                <div className="flex items-center gap-1 text-xs text-[var(--success)]">
                  <Sparkles className="w-3 h-3" />
                  <span className="font-medium">
                    +{pkg.bonus.toLocaleString()} bonus tokens
                  </span>
                </div>
              )}

              <div className="mt-2 pt-2 border-t border-[var(--border)]">
                <div className="text-xs text-[var(--text-secondary)]">
                  {pkg.tokens.toLocaleString()} base + {pkg.bonus.toLocaleString()} bonus
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected package summary */}
        {selectedPkg && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--bg-tertiary)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[var(--text-secondary)] mb-1">
                  You'll receive
                </div>
                <div className="text-2xl font-bold">
                  {(selectedPkg.tokens + selectedPkg.bonus).toLocaleString()} tokens
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-[var(--text-secondary)] mb-1">
                  Total
                </div>
                <div className="text-2xl font-bold text-[var(--primary-500)]">
                  ${selectedPkg.price}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Zap className="w-3 h-3" />
                <span>
                  New balance:{' '}
                  <span className="font-medium text-[var(--text-primary)]">
                    {(currentBalance + selectedPkg.tokens + selectedPkg.bonus).toLocaleString()} tokens
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePurchase}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Processing...' : 'Continue to Payment'}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-[var(--text-secondary)]">
          Secure payment powered by Stripe • Tokens never expire
        </div>
      </Card>
    </div>
  );
}
