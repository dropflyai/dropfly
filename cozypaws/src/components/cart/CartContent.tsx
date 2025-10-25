'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cart';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function CartContent() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotalCents } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotalCents = getTotalCents();
  const discountCents = Math.floor(subtotalCents * (discount / 100));
  const totalCents = subtotalCents - discountCents;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsApplyingPromo(true);
    try {
      // Mock promo code validation - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (promoCode.toUpperCase() === 'SAVE10') {
        setDiscount(10);
        toast.success('Promo code applied! 10% discount');
      } else {
        toast.error('Invalid promo code');
      }
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          successUrl: `${window.location.origin}/order/{CHECKOUT_SESSION_ID}/success`,
          cancelUrl: `${window.location.origin}/cart`,
          promoCode: promoCode || undefined,
        }),
      });

      if (!response.ok) throw new Error('Checkout failed');

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast.error('Checkout failed. Please try again.');
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="mx-auto h-24 w-24 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h2 className="mt-6 text-2xl font-semibold text-gray-900">Your cart is empty</h2>
        <p className="mt-2 text-gray-600">Start shopping to add items to your cart</p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 inline-flex items-center rounded-md bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.id} className="p-6">
              <div className="flex gap-6">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-24 rounded-md object-cover flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">SKU: {item.sku}</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    ${(item.priceCents / 100).toFixed(2)}
                  </p>

                  <div className="mt-4 flex items-center gap-4">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-50"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="px-4 py-1.5 text-sm font-medium text-gray-900 min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => {
                        removeItem(item.id);
                        toast.success('Item removed from cart');
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>

                  {item.quantity >= item.stock && (
                    <p className="mt-2 text-sm text-orange-600">Maximum stock reached</p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
          <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>

          {/* Promo Code */}
          <div className="mt-6">
            <label htmlFor="promo" className="block text-sm font-medium text-gray-700">
              Promo Code
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                id="promo"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 border"
              />
              <button
                onClick={handleApplyPromo}
                disabled={isApplyingPromo}
                className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                {isApplyingPromo ? 'Applying...' : 'Apply'}
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <dl className="mt-6 space-y-4 border-t border-gray-200 pt-6">
            <div className="flex justify-between text-sm">
              <dt className="text-gray-600">Subtotal</dt>
              <dd className="font-medium text-gray-900">${(subtotalCents / 100).toFixed(2)}</dd>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <dt className="text-green-600">Discount ({discount}%)</dt>
                <dd className="font-medium text-green-600">-${(discountCents / 100).toFixed(2)}</dd>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <dt className="text-gray-600">Shipping</dt>
              <dd className="font-medium text-gray-900">
                {totalCents >= 5000 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  `$${((500 - (totalCents >= 5000 ? 500 : 0)) / 100).toFixed(2)}`
                )}
              </dd>
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-4">
              <dt className="text-base font-semibold text-gray-900">Total</dt>
              <dd className="text-base font-semibold text-gray-900">
                ${((totalCents + (totalCents >= 5000 ? 0 : 500)) / 100).toFixed(2)}
              </dd>
            </div>
          </dl>

          {totalCents < 5000 && (
            <p className="mt-4 text-sm text-gray-600 text-center">
              Add ${((5000 - totalCents) / 100).toFixed(2)} more for free shipping!
            </p>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="mt-6 w-full rounded-md bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:opacity-50"
          >
            {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
          </button>

          {/* Trust Badges */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              <span>Fast Shipping</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
