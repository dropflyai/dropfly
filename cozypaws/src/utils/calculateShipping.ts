export function calculateShipping(subtotalCents: number): number {
  const FREE_SHIPPING_THRESHOLD = 4900;
  const STANDARD_SHIPPING_CENTS = 599;

  if (subtotalCents >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  return STANDARD_SHIPPING_CENTS;
}

export function isFreeShippingEligible(subtotalCents: number): boolean {
  return subtotalCents >= 4900;
}

export function getRemainingForFreeShipping(subtotalCents: number): number {
  const FREE_SHIPPING_THRESHOLD = 4900;

  if (subtotalCents >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  return FREE_SHIPPING_THRESHOLD - subtotalCents;
}
