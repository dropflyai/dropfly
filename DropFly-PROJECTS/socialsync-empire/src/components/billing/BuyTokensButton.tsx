'use client';

import { useState } from 'react';
import { Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import { TokenPurchaseModal } from './TokenPurchaseModal';

interface BuyTokensButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  currentBalance?: number;
  className?: string;
}

export function BuyTokensButton({
  variant = 'secondary',
  size = 'sm',
  currentBalance = 0,
  className,
}: BuyTokensButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        <Zap className="w-4 h-4 mr-1" />
        Buy Tokens
      </Button>

      <TokenPurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentBalance={currentBalance}
      />
    </>
  );
}
