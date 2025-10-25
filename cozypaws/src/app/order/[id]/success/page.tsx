import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrackingWidget } from '@/components/order/TrackingWidget';
import { ReferralCTA } from '@/components/order/ReferralCTA';

interface Order {
  id: string;
  email: string;
  totalCents: number;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: string;
}

async function getOrder(id: string): Promise<Order | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: 'Order Confirmed - CozyPaws Outlet',
    description: 'Your order has been confirmed. Thank you for shopping with CozyPaws Outlet!',
  };
}

export default async function OrderSuccessPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Header */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="mt-2 text-lg text-gray-600">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        {/* Order Details */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>

          <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-600">Order Number</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{order.id.slice(0, 8).toUpperCase()}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-600">Order Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-600">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{order.email}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-600">Total Amount</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900">
                ${(order.totalCents / 100).toFixed(2)}
              </dd>
            </div>
          </dl>

          {/* Confirmation Email Notice */}
          <div className="mt-8 rounded-lg bg-blue-50 p-4 border border-blue-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  A confirmation email has been sent to <strong>{order.email}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Widget */}
        <div className="mt-8">
          <TrackingWidget orderId={order.id} />
        </div>

        {/* Referral CTA */}
        <div className="mt-8">
          <ReferralCTA />
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            Continue Shopping
          </a>
          <a
            href={`/order/${order.id}/track`}
            className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Track Order
          </a>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            Need help with your order?{' '}
            <a href="/support" className="font-medium text-orange-600 hover:text-orange-500">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
