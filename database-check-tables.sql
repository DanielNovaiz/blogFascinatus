-- Check all tables with 'orders' in the name
SELECT 
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_name LIKE '%orders%';

-- Check which table has the test data
SELECT 
  'public.orders' as table_name,
  COUNT(*) as count,
  SUM(total_amount) as total
FROM orders
WHERE customer_email LIKE 'test%@example.com' OR customer_email LIKE 'daily%@example.com';
