import { useCartStore } from '@/lib/store/cart';

export function useCart() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalCents = useCartStore((state) => state.getTotalCents);
  const getItemCount = useCartStore((state) => state.getItemCount);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalCents,
    getItemCount,
  };
}
