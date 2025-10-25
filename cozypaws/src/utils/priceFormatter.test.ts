import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  parsePriceToCents,
  formatPriceRange,
  formatDiscount,
} from './priceFormatter';

describe('formatPrice', () => {
  it('should format cents to dollar string with two decimals', () => {
    expect(formatPrice(0)).toBe('$0.00');
    expect(formatPrice(100)).toBe('$1.00');
    expect(formatPrice(1234)).toBe('$12.34');
    expect(formatPrice(999)).toBe('$9.99');
    expect(formatPrice(10000)).toBe('$100.00');
  });

  it('should handle single cent values', () => {
    expect(formatPrice(1)).toBe('$0.01');
    expect(formatPrice(99)).toBe('$0.99');
  });

  it('should handle large amounts', () => {
    expect(formatPrice(100000)).toBe('$1000.00');
    expect(formatPrice(1234567)).toBe('$12345.67');
  });

  it('should always show two decimal places', () => {
    expect(formatPrice(500)).toBe('$5.00');
    expect(formatPrice(1050)).toBe('$10.50');
  });
});

describe('parsePriceToCents', () => {
  it('should parse dollar strings to cents', () => {
    expect(parsePriceToCents('$0.00')).toBe(0);
    expect(parsePriceToCents('$1.00')).toBe(100);
    expect(parsePriceToCents('$12.34')).toBe(1234);
    expect(parsePriceToCents('$9.99')).toBe(999);
  });

  it('should handle strings without dollar sign', () => {
    expect(parsePriceToCents('10.00')).toBe(1000);
    expect(parsePriceToCents('5.50')).toBe(550);
  });

  it('should handle strings with commas', () => {
    expect(parsePriceToCents('$1,234.56')).toBe(123456);
    expect(parsePriceToCents('10,000.00')).toBe(1000000);
  });

  it('should handle single decimal place', () => {
    expect(parsePriceToCents('$5.5')).toBe(550);
  });

  it('should handle whole numbers', () => {
    expect(parsePriceToCents('$10')).toBe(1000);
    expect(parsePriceToCents('100')).toBe(10000);
  });

  it('should throw error for invalid formats', () => {
    expect(() => parsePriceToCents('invalid')).toThrow('Invalid price format');
    expect(() => parsePriceToCents('abc')).toThrow('Invalid price format');
    expect(() => parsePriceToCents('')).toThrow('Invalid price format');
  });

  it('should round to nearest cent', () => {
    expect(parsePriceToCents('$1.234')).toBe(123);
    expect(parsePriceToCents('$1.235')).toBe(124);
  });
});

describe('formatPriceRange', () => {
  it('should format range when prices differ', () => {
    expect(formatPriceRange(1000, 5000)).toBe('$10.00 - $50.00');
    expect(formatPriceRange(99, 999)).toBe('$0.99 - $9.99');
  });

  it('should format single price when min equals max', () => {
    expect(formatPriceRange(1000, 1000)).toBe('$10.00');
    expect(formatPriceRange(5000, 5000)).toBe('$50.00');
  });

  it('should handle zero values', () => {
    expect(formatPriceRange(0, 0)).toBe('$0.00');
    expect(formatPriceRange(0, 1000)).toBe('$0.00 - $10.00');
  });
});

describe('formatDiscount', () => {
  it('should calculate discount percentage', () => {
    expect(formatDiscount(10000, 5000)).toBe('50% off');
    expect(formatDiscount(10000, 7500)).toBe('25% off');
    expect(formatDiscount(10000, 9000)).toBe('10% off');
  });

  it('should round to nearest percentage', () => {
    expect(formatDiscount(10000, 6700)).toBe('33% off');
    expect(formatDiscount(10000, 6666)).toBe('33% off');
  });

  it('should handle 100% discount', () => {
    expect(formatDiscount(10000, 0)).toBe('100% off');
  });

  it('should handle small discounts', () => {
    expect(formatDiscount(10000, 9950)).toBe('1% off');
    expect(formatDiscount(10000, 9900)).toBe('1% off');
  });

  it('should handle no discount', () => {
    expect(formatDiscount(10000, 10000)).toBe('0% off');
  });
});
