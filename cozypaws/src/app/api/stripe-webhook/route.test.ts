import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import Stripe from 'stripe';

vi.mock('stripe');
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 'order-123',
              email: 'test@example.com',
            },
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn((name: string) => {
      if (name === 'stripe-signature') {
        return 'valid-signature';
      }
      return null;
    }),
  })),
}));

const mockStripeWebhooksConstructEvent = vi.fn();
const mockStripeSdk = {
  webhooks: {
    constructEvent: mockStripeWebhooksConstructEvent,
  },
};

vi.mocked(Stripe).mockImplementation(() => mockStripeSdk as any);

global.fetch = vi.fn();

describe('POST /api/stripe-webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.CJ_ACCESS_TOKEN = 'cj-token-123';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 400 if no signature header', async () => {
    const headersModule = await import('next/headers');
    vi.mocked(headersModule.headers).mockReturnValue({
      get: vi.fn(() => null),
    } as any);

    const mockRequest = {
      text: vi.fn().mockResolvedValue('{}'),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('No signature');
  });

  it('should return 400 if signature verification fails', async () => {
    mockStripeWebhooksConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const mockRequest = {
      text: vi.fn().mockResolvedValue('{"type": "checkout.session.completed"}'),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid signature');
  });

  it('should process checkout.session.completed event successfully', async () => {
    const mockSession: Partial<Stripe.Checkout.Session> = {
      id: 'cs_test_123',
      customer_details: {
        email: 'customer@example.com',
        name: 'John Doe',
        address: {
          line1: '123 Main St',
          line2: 'Apt 4',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94102',
          country: 'US',
        },
        phone: '+15551234567',
        tax_exempt: 'none',
        tax_ids: [],
      },
      payment_intent: 'pi_test_123',
      amount_subtotal: 5000,
      amount_total: 5000,
      total_details: {
        amount_discount: 0,
        amount_shipping: 0,
        amount_tax: 0,
      },
      metadata: {
        cartItems: JSON.stringify([
          {
            id: 'prod-1',
            quantity: 2,
            name: 'Dog Toy',
            priceCents: 1299,
            sku: 'DOG-TOY-001',
            supplier: 'cj_dropshipping',
            supplierProductId: 'cj-123',
          },
        ]),
      },
    };

    mockStripeWebhooksConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: mockSession,
      },
    });

    const mockCJResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        code: 200,
        data: {
          orderId: 'cj-order-123',
        },
      }),
    };

    vi.mocked(global.fetch).mockResolvedValue(mockCJResponse as any);

    const mockRequest = {
      text: vi.fn().mockResolvedValue(JSON.stringify(mockSession)),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
  });

  it('should handle missing cart items metadata', async () => {
    const mockSession: Partial<Stripe.Checkout.Session> = {
      id: 'cs_test_123',
      customer_details: {
        email: 'customer@example.com',
        name: 'John Doe',
        address: {
          line1: '123 Main St',
          line2: null,
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94102',
          country: 'US',
        },
        phone: null,
        tax_exempt: 'none',
        tax_ids: [],
      },
      metadata: {},
    };

    mockStripeWebhooksConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: mockSession,
      },
    });

    const mockRequest = {
      text: vi.fn().mockResolvedValue(JSON.stringify(mockSession)),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('No cart items in metadata');
  });

  it('should handle CJ API failure gracefully', async () => {
    const mockSession: Partial<Stripe.Checkout.Session> = {
      id: 'cs_test_123',
      customer_details: {
        email: 'customer@example.com',
        name: 'John Doe',
        address: {
          line1: '123 Main St',
          line2: null,
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94102',
          country: 'US',
        },
        phone: null,
        tax_exempt: 'none',
        tax_ids: [],
      },
      payment_intent: 'pi_test_123',
      amount_subtotal: 5000,
      amount_total: 5000,
      total_details: {
        amount_discount: 0,
        amount_shipping: 0,
        amount_tax: 0,
      },
      metadata: {
        cartItems: JSON.stringify([
          {
            id: 'prod-1',
            quantity: 1,
            name: 'Dog Toy',
            priceCents: 1299,
            sku: 'DOG-TOY-001',
            supplier: 'cj_dropshipping',
            supplierProductId: 'cj-123',
          },
        ]),
      },
    };

    mockStripeWebhooksConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: mockSession,
      },
    });

    const mockCJResponse = {
      ok: false,
      status: 500,
    };

    vi.mocked(global.fetch).mockResolvedValue(mockCJResponse as any);

    const mockRequest = {
      text: vi.fn().mockResolvedValue(JSON.stringify(mockSession)),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('CJ order creation failed');
  });

  it('should skip CJ order creation for non-CJ items', async () => {
    const mockSession: Partial<Stripe.Checkout.Session> = {
      id: 'cs_test_123',
      customer_details: {
        email: 'customer@example.com',
        name: 'John Doe',
        address: {
          line1: '123 Main St',
          line2: null,
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94102',
          country: 'US',
        },
        phone: null,
        tax_exempt: 'none',
        tax_ids: [],
      },
      payment_intent: 'pi_test_123',
      amount_subtotal: 5000,
      amount_total: 5000,
      total_details: {
        amount_discount: 0,
        amount_shipping: 0,
        amount_tax: 0,
      },
      metadata: {
        cartItems: JSON.stringify([
          {
            id: 'prod-1',
            quantity: 1,
            name: 'Cat Toy',
            priceCents: 999,
            sku: 'CAT-TOY-001',
            supplier: 'aliexpress',
          },
        ]),
      },
    };

    mockStripeWebhooksConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: mockSession,
      },
    });

    const mockRequest = {
      text: vi.fn().mockResolvedValue(JSON.stringify(mockSession)),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle non-checkout events', async () => {
    mockStripeWebhooksConstructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: {
        object: {},
      },
    });

    const mockRequest = {
      text: vi.fn().mockResolvedValue('{}'),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
  });
});
