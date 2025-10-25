import { describe, it, expect } from 'vitest';
import {
  calculateShipping,
  isFreeShippingEligible,
  getRemainingForFreeShipping,
} from './calculateShipping';

describe('calculateShipping', () => {
  it('should return $5.99 for subtotal less than $49', () => {
    expect(calculateShipping(0)).toBe(599);
    expect(calculateShipping(1000)).toBe(599);
    expect(calculateShipping(4800)).toBe(599);
    expect(calculateShipping(4899)).toBe(599);
  });

  it('should return $0 for subtotal of exactly $49', () => {
    expect(calculateShipping(4900)).toBe(0);
  });

  it('should return $0 for subtotal greater than $49', () => {
    expect(calculateShipping(5000)).toBe(0);
    expect(calculateShipping(10000)).toBe(0);
    expect(calculateShipping(100000)).toBe(0);
  });

  it('should handle edge case at boundary', () => {
    expect(calculateShipping(4900)).toBe(0);
    expect(calculateShipping(4899)).toBe(599);
  });
});

describe('isFreeShippingEligible', () => {
  it('should return false for subtotal less than $49', () => {
    expect(isFreeShippingEligible(0)).toBe(false);
    expect(isFreeShippingEligible(1000)).toBe(false);
    expect(isFreeShippingEligible(4899)).toBe(false);
  });

  it('should return true for subtotal of $49 or more', () => {
    expect(isFreeShippingEligible(4900)).toBe(true);
    expect(isFreeShippingEligible(5000)).toBe(true);
    expect(isFreeShippingEligible(10000)).toBe(true);
  });
});

describe('getRemainingForFreeShipping', () => {
  it('should return correct remaining amount for subtotal less than $49', () => {
    expect(getRemainingForFreeShipping(0)).toBe(4900);
    expect(getRemainingForFreeShipping(1000)).toBe(3900);
    expect(getRemainingForFreeShipping(2500)).toBe(2400);
    expect(getRemainingForFreeShipping(4899)).toBe(1);
  });

  it('should return 0 for subtotal of $49 or more', () => {
    expect(getRemainingForFreeShipping(4900)).toBe(0);
    expect(getRemainingForFreeShipping(5000)).toBe(0);
    expect(getRemainingForFreeShipping(10000)).toBe(0);
  });

  it('should handle exact boundary', () => {
    expect(getRemainingForFreeShipping(4900)).toBe(0);
    expect(getRemainingForFreeShipping(4899)).toBe(1);
  });
});
