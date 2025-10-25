'use client';

import { useQuery } from '@tanstack/react-query';

interface TrackingData {
  orderId: string;
  status: string;
  supplierOrders: Array<{
    supplier: string;
    trackingNumber?: string;
    trackingUrl?: string;
    carrier?: string;
    status: string;
    estimatedDelivery?: string;
  }>;
}

async function fetchTracking(orderId: string): Promise<TrackingData> {
  const res = await fetch(`/api/orders/${orderId}/track`);
  if (!res.ok) throw new Error('Failed to fetch tracking');
  return res.json();
}

export function TrackingWidget({ orderId }: { orderId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tracking', orderId],
    queryFn: () => fetchTracking(orderId),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-xl font-semibold text-gray-900">Tracking Information</h2>
        <p className="mt-4 text-gray-600">
          Tracking information will be available once your order is shipped.
        </p>
      </div>
    );
  }

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📦' },
    { key: 'processing', label: 'Processing', icon: '⚙️' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✅' },
  ];

  const currentStepIndex = statusSteps.findIndex((step) => step.key === data.status);

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-xl font-semibold text-gray-900">Tracking Information</h2>

      {/* Order Status Timeline */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          {statusSteps.map((step, index) => (
            <div key={step.key} className="flex-1">
              <div className="relative">
                {/* Connector Line */}
                {index < statusSteps.length - 1 && (
                  <div
                    className={`absolute top-6 left-1/2 h-0.5 w-full ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}

                {/* Step Circle */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                      index <= currentStepIndex
                        ? 'bg-green-100 ring-2 ring-green-500'
                        : 'bg-gray-100 ring-2 ring-gray-300'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <p
                    className={`mt-2 text-xs font-medium ${
                      index <= currentStepIndex ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Tracking Details */}
      {data.supplierOrders.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Shipment Details</h3>
          {data.supplierOrders.map((shipment, index) => (
            <div key={index} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {shipment.supplier.replace('_', ' ')}
                  </p>
                  {shipment.carrier && (
                    <p className="mt-1 text-xs text-gray-500">Carrier: {shipment.carrier}</p>
                  )}
                  {shipment.trackingNumber && (
                    <p className="mt-1 text-xs text-gray-500 font-mono">
                      Tracking: {shipment.trackingNumber}
                    </p>
                  )}
                  {shipment.estimatedDelivery && (
                    <p className="mt-1 text-xs text-gray-500">
                      Est. Delivery:{' '}
                      {new Date(shipment.estimatedDelivery).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
                {shipment.trackingUrl && (
                  <a
                    href={shipment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-500"
                  >
                    Track
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
