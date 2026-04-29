-- Seed Sales Data for Dashboard Testing
-- Simulates monthly growth starting from 120 reais

-- Clear existing test data
DELETE FROM orders WHERE customer_email LIKE 'test%@example.com' OR customer_email LIKE 'daily%@example.com';

-- Generate orders with monthly growth
-- Month 1: 120 reais
-- Month 2: 240 reais (120 * 2)
-- Month 3: 1200 reais (120 * 10)
-- Month 4: 6000 reais (1200 * 5)
-- Month 5: 6600 reais (6000 * 1.10)

-- Insert orders for Month 1 (120 reais total) - 4 months ago
INSERT INTO orders (customer_email, customer_name, items, total_amount, status, created_at)
SELECT
  'test1_' || generate_series || '@example.com' as customer_email,
  'Customer ' || generate_series as customer_name,
  '[{"product_id": "1", "name": "Product A", "quantity": 1, "price": 120.00}]'::jsonb as items,
  120.00 as total_amount,
  CASE WHEN random() > 0.2 THEN 'completed' ELSE 'pending' END as status,
  NOW() - INTERVAL '4 months' as created_at
FROM generate_series(1, 1);

-- Insert orders for Month 2 (240 reais total - 2x growth) - 3 months ago
INSERT INTO orders (customer_email, customer_name, items, total_amount, status, created_at)
SELECT
  'test2_' || generate_series || '@example.com' as customer_email,
  'Customer ' || generate_series as customer_name,
  '[{"product_id": "1", "name": "Product A", "quantity": 1, "price": 240.00}]'::jsonb as items,
  240.00 as total_amount,
  CASE WHEN random() > 0.2 THEN 'completed' ELSE 'pending' END as status,
  NOW() - INTERVAL '3 months' as created_at
FROM generate_series(1, 1);

-- Insert orders for Month 3 (1200 reais total - 5x growth) - 2 months ago
INSERT INTO orders (customer_email, customer_name, items, total_amount, status, created_at)
SELECT
  'test3_' || generate_series || '@example.com' as customer_email,
  'Customer ' || generate_series as customer_name,
  '[{"product_id": "1", "name": "Product A", "quantity": 1, "price": 1200.00}]'::jsonb as items,
  1200.00 as total_amount,
  CASE WHEN random() > 0.2 THEN 'completed' ELSE 'pending' END as status,
  NOW() - INTERVAL '2 months' as created_at
FROM generate_series(1, 1);

-- Insert orders for Month 4 (6000 reais total - 5x growth) - 1 month ago
INSERT INTO orders (customer_email, customer_name, items, total_amount, status, created_at)
SELECT
  'test4_' || generate_series || '@example.com' as customer_email,
  'Customer ' || generate_series as customer_name,
  '[{"product_id": "1", "name": "Product A", "quantity": 1, "price": 6000.00}]'::jsonb as items,
  6000.00 as total_amount,
  CASE WHEN random() > 0.2 THEN 'completed' ELSE 'pending' END as status,
  NOW() - INTERVAL '1 month' as created_at
FROM generate_series(1, 1);

-- Insert orders for Month 5 (6600 reais total - 1.10x growth) - recent
INSERT INTO orders (customer_email, customer_name, items, total_amount, status, created_at)
SELECT
  'test5_' || generate_series || '@example.com' as customer_email,
  'Customer ' || generate_series as customer_name,
  '[{"product_id": "1", "name": "Product A", "quantity": 1, "price": 6600.00}]'::jsonb as items,
  6600.00 as total_amount,
  CASE WHEN random() > 0.2 THEN 'completed' ELSE 'pending' END as status,
  NOW() as created_at
FROM generate_series(1, 1);

-- Insert orders for recent days (to show daily sales chart)
-- Last 30 days with varying amounts
INSERT INTO orders (customer_email, customer_name, items, total_amount, status, created_at)
SELECT
  'daily_' || generate_series || '@example.com' as customer_email,
  'Daily Customer ' || generate_series as customer_name,
  jsonb_build_object(
    'product_id', '1',
    'name', 'Product A',
    'quantity', 1,
    'price', (100 + (random() * 500)::INTEGER)::DECIMAL(10,2)
  ) as items,
  100 + (random() * 500)::DECIMAL(10,2) as total_amount,
  CASE WHEN random() > 0.1 THEN 'paid' WHEN random() > 0.05 THEN 'shipped' ELSE 'completed' END as status,
  NOW() - (generate_series || ' days')::INTERVAL as created_at
FROM generate_series(0, 29);
