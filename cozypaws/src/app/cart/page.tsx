import { Metadata } from 'next';
import { CartContent } from '@/components/cart/CartContent';

export const metadata: Metadata = {
  title: 'Shopping Cart - CozyPaws Outlet',
  description: 'Review your shopping cart and proceed to checkout',
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        <CartContent />
      </div>
    </main>
  );
}
