export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

export function parsePriceToCents(priceString: string): number {
  const cleanPrice = priceString.replace(/[$,]/g, '');
  const dollars = parseFloat(cleanPrice);

  if (isNaN(dollars)) {
    throw new Error('Invalid price format');
  }

  return Math.round(dollars * 100);
}

export function formatPriceRange(minCents: number, maxCents: number): string {
  if (minCents === maxCents) {
    return formatPrice(minCents);
  }

  return `${formatPrice(minCents)} - ${formatPrice(maxCents)}`;
}

export function formatDiscount(originalCents: number, discountedCents: number): string {
  const savingsCents = originalCents - discountedCents;
  const percentage = Math.round((savingsCents / originalCents) * 100);

  return `${percentage}% off`;
}
