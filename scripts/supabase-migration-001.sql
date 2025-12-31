-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  cost_cents INTEGER NOT NULL,
  supplier TEXT NOT NULL,
  supplier_product_id TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  shipping_name TEXT NOT NULL,
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  shipping_country TEXT NOT NULL DEFAULT 'US',
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL,
  tax_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  supplier_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Public can read products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Service role can insert products" ON products
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can update products" ON products
  FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can delete products" ON products
  FOR DELETE USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for orders
CREATE POLICY "Users can read their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert orders" ON orders
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can update orders" ON orders
  FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for order_items
CREATE POLICY "Users can read their order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert order items" ON order_items
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for reviews
CREATE POLICY "Public can read reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for admin_users
CREATE POLICY "Service role can manage admins" ON admin_users
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Seed data: 3 realistic dog toys from CJ Dropshipping catalog
INSERT INTO products (sku, name, description, category, price_cents, cost_cents, supplier, supplier_product_id, stock, images, rating) VALUES
('CJ-DOG-ROPE-001', 'Durable Cotton Rope Tug Toy for Dogs', 'Heavy-duty braided cotton rope toy perfect for interactive play and teeth cleaning. Suitable for medium to large dogs. Length: 14 inches.', 'dog', 1299, 520, 'cj_dropshipping', 'CJ-123456789', 500, ARRAY['https://images.unsplash.com/photo-1535924530232-51d3f11697e9'], 4.50),
('CJ-DOG-BALL-002', 'Interactive Treat Dispensing Ball', 'Durable rubber ball that dispenses treats as your dog plays. Keeps dogs mentally stimulated and engaged. Diameter: 3.5 inches. BPA-free.', 'dog', 1499, 600, 'cj_dropshipping', 'CJ-987654321', 750, ARRAY['https://images.unsplash.com/photo-1587300003388-59208cc962cb'], 4.75),
('CJ-DOG-SQUEAK-003', 'Plush Squeaky Dog Toy Set (3-Pack)', 'Soft plush toys with built-in squeakers. Set includes duck, bone, and ball shapes. Machine washable. Ideal for small to medium dogs.', 'dog', 1799, 680, 'cj_dropshipping', 'CJ-456789123', 320, ARRAY['https://images.unsplash.com/photo-1589924691995-400dc9ecc119'], 4.25);
