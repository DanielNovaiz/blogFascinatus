-- Admin Panel Schema Extensions
-- Execute this in Supabase SQL Editor

-- Enable pg_trgm for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Orders table (complementando products)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'shipped', 'completed', 'cancelled', 'refunded')),
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_intent_id TEXT,
  shipping_address JSONB,
  items JSONB NOT NULL, -- [{product_id, name, price, quantity, image}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Support chats table
CREATE TABLE IF NOT EXISTS support_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_to UUID REFERENCES admin_users(id)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES support_chats(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('customer', 'admin')),
  sender_id TEXT, -- admin user id or customer email
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- Price negotiations
CREATE TABLE IF NOT EXISTS price_negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  original_price DECIMAL(10, 2) NOT NULL,
  proposed_price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'counter_offered', 'accepted', 'rejected', 'expired')),
  admin_response TEXT,
  counter_price DECIMAL(10, 2),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

CREATE INDEX IF NOT EXISTS idx_chats_status ON support_chats(status);
CREATE INDEX IF NOT EXISTS idx_chats_assigned_to ON support_chats(assigned_to);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_negotiations_status ON price_negotiations(status);
CREATE INDEX IF NOT EXISTS idx_negotiations_product_id ON price_negotiations(product_id);

-- GIN index for fuzzy search on products
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON products USING gin (description gin_trgm_ops);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_negotiations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
-- Allow login by checking email/password without auth
CREATE POLICY "Allow login check" ON admin_users
  FOR SELECT USING (true);

CREATE POLICY "Admins can update admins" ON admin_users
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert admins" ON admin_users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert orders" ON orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for support_chats
CREATE POLICY "Admins can view all chats" ON support_chats
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update chats" ON support_chats
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert chats" ON support_chats
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for chat_messages
CREATE POLICY "Admins can view all messages" ON chat_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update messages" ON chat_messages
  FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for price_negotiations
CREATE POLICY "Admins can view all negotiations" ON price_negotiations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update negotiations" ON price_negotiations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON support_chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_negotiations_updated_at BEFORE UPDATE ON price_negotiations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
