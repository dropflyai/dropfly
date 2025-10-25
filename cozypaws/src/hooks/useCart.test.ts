import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from './useCart';
import { useCartStore } from '@/lib/store/cart';

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useCart', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useCartStore.setState({ items: [] });
  });

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart());

    expect(result.current.items).toEqual([]);
    expect(result.current.getItemCount()).toBe(0);
    expect(result.current.getTotalCents()).toBe(0);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 'prod-1',
        sku: 'DOG-TOY-001',
        name: 'Dog Toy',
        priceCents: 1299,
        image: 'https://example.com/image.jpg',
        stock: 10,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      id: 'prod-1',
      sku: 'DOG-TOY-001',
      name: 'Dog Toy',
      priceCents: 1299,
      quantity: 1,
    });
    expect(result.current.getItemCount()).toBe(1);
    expect(result.current.getTotalCents()).toBe(1299);
  });

  it('should add multiple items', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 'prod-1',
        sku: 'DOG-TOY-001',
        name: 'Dog Toy',
        priceCents: 1299,
        image: 'https://example.com/image1.jpg',
        stock: 10,
      });

      result.current.addItem({
        id: 'prod-2',
        sku: 'CAT-TOY-001',
        name: 'Cat Toy',
        priceCents: 999,
        image: 'https://example.com/image2.jpg',
        stock: 5,
      });
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.getItemCount()).toBe(2);
    expect(result.current.getTotalCents()).toBe(2298);
  });

  it('should increment quantity when adding existing item', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 'prod-1',
        sku: 'DOG-TOY-001',
        name: 'Dog Toy',
        priceCents: 1299,
        image: 'https://example.com/image.jpg',
        stock: 10,
      });

      result.current.addItem({
        id: 'prod-1',
        sku: 'DOG-TOY-001',
        name: 'Dog Toy',
        priceCents: 1299,
        image: 'https://example.com/image.jpg',
        stock: 10,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.getItemCount()).toBe(2);
    expect(result.current.getTotalCents()).toBe(2598);
  });

  it('should add item with custom quantity', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 'prod-1',
        sku: 'DOG-TOY-001',
        name: 'Dog Toy',
        priceCents: 1299,
        image: 'https://example.com/image.jpg',
        stock: 10,
        quantity: 3,
      });
    });

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.getItemCount()).toBe(3);
    expect(result.current.getTotalCents()).toBe(3897);
  });

  it('should not exceed stock when adding items', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 'prod-1',
        sku: 'DOG-TOY-001',
        name: 'Dog Toy',
        priceCents: 1299,
        image: 'https://example.com/image.jpg',
        stock: 5,
        quantity: 3,
      });

      result.current.addItem({
        id: 'prod-1',
        sku: 'DOG-TOY-001',
        name: 'Dog Toy',
        priceCents: 1299,
        image: 'https://example.com/image.jpg',
        stock: 5,
        quantity: 3,
      });
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.getItemCount()).toBe(5);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 'prod-1',
        sku: 'DOG-TOY-001',
        name: 'Dog Toy',
        priceCents: 1299,
        image: 'https://example.com/image.jpg',
        stock: 10,
      });

      result.current.addItem({
        id: 'prod-2',
        sku: 'CAT-TOY-001',
        name: 'Cat Toy',
        priceCents: 999,
        image: 'https://example.com/image2.jpg',
        stock: 5,
      });
    });

    act(() => {
      result.current.removeItem('prod-1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('prod-2');
    expect(result.current.getItemCount()).toBe(1);
    expect(result.current.getTotalCents()).toBe(999);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 'prod-1',
        sku: 'DOG-TOY-001',
        name: 'Dog Toy',
        priceCents: 1299,
        image: 'https://example.com/image.jpg',
        stock: 10,
      });
    });

    act(() => {
      result.current.updateQuantity('prod-1', 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.getItemCount()).toBe(5);
    expect(result.current.getTotalCents()).toBe(6495);
  });

  it('should remove item when updating quantity to 0', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 'prod-1',
        sku: 'DOG-TOY-001',
        name: 'Dog Toy',
        priceCents: 1299,
        image: 'https://example.com/image.jpg',
        stock: 10,
      });
    });

    act(() => {
      result.current.updateQuantity('prod-1', 0);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.getItemCount()).toBe(0);
    expect(result.current.getTotalCents()).toBe(0);
  });

  it('should not exceed stock when updating quantity', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 'prod-1',
        sku: 'DOG-TOY-001',
        name: 'Dog Toy',
        priceCents: 1299,
        image: 'https://example.com/image.jpg',
        stock: 5,
      });
    });

    act(() => {
      result.current.updateQuantity('prod-1', 10);
    });

    expect(result.current.items[0].quantity).toBe(5);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 'prod-1',
        sku: 'DOG-TOY-001',
        name: 'Dog Toy',
        priceCents: 1299,
        image: 'https://example.com/image.jpg',
        stock: 10,
      });

      result.current.addItem({
        id: 'prod-2',
        sku: 'CAT-TOY-001',
        name: 'Cat Toy',
        priceCents: 999,
        image: 'https://example.com/image2.jpg',
        stock: 5,
      });
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.getItemCount()).toBe(0);
    expect(result.current.getTotalCents()).toBe(0);
  });

  it('should calculate total correctly with multiple items', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 'prod-1',
        sku: 'DOG-TOY-001',
        name: 'Dog Toy',
        priceCents: 1299,
        image: 'https://example.com/image1.jpg',
        stock: 10,
        quantity: 2,
      });

      result.current.addItem({
        id: 'prod-2',
        sku: 'CAT-TOY-001',
        name: 'Cat Toy',
        priceCents: 999,
        image: 'https://example.com/image2.jpg',
        stock: 5,
        quantity: 3,
      });
    });

    expect(result.current.getTotalCents()).toBe(1299 * 2 + 999 * 3);
    expect(result.current.getItemCount()).toBe(5);
  });

  it('should persist cart to localStorage', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 'prod-1',
        sku: 'DOG-TOY-001',
        name: 'Dog Toy',
        priceCents: 1299,
        image: 'https://example.com/image.jpg',
        stock: 10,
      });
    });

    const stored = localStorageMock.getItem('cozypaws-cart');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.items).toHaveLength(1);
    expect(parsed.state.items[0].id).toBe('prod-1');
  });

  it('should restore cart from localStorage', () => {
    localStorageMock.setItem(
      'cozypaws-cart',
      JSON.stringify({
        state: {
          items: [
            {
              id: 'prod-1',
              sku: 'DOG-TOY-001',
              name: 'Dog Toy',
              priceCents: 1299,
              image: 'https://example.com/image.jpg',
              stock: 10,
              quantity: 2,
            },
          ],
        },
      })
    );

    useCartStore.persist.rehydrate();

    const { result } = renderHook(() => useCart());

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('prod-1');
    expect(result.current.items[0].quantity).toBe(2);
  });
});
