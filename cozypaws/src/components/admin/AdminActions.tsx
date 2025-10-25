'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function AdminActions() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleSyncProducts = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/sync-products', {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Sync failed');

      const data = await res.json();
      toast.success(
        `Successfully synced ${data.synced.cj_dropshipping + data.synced.aliexpress} products!`
      );
    } catch (error) {
      toast.error('Failed to sync products');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResendTracking = async () => {
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    setIsResending(true);
    try {
      const res = await fetch('/api/admin/resend-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.trim() }),
      });

      if (!res.ok) throw new Error('Resend failed');

      toast.success('Tracking email sent successfully!');
      setOrderId('');
    } catch (error) {
      toast.error('Failed to resend tracking email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h3 className="text-base font-semibold text-gray-900">Sync Products</h3>
        <p className="mt-1 text-sm text-gray-600">
          Fetch latest products from CJ Dropshipping and AliExpress
        </p>
        <button
          onClick={handleSyncProducts}
          disabled={isSyncing}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Syncing...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Sync Now
            </>
          )}
        </button>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h3 className="text-base font-semibold text-gray-900">Resend Tracking Email</h3>
        <p className="mt-1 text-sm text-gray-600">
          Send tracking information to customer
        </p>
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Order ID"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 border"
          />
          <button
            onClick={handleResendTracking}
            disabled={isResending}
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
