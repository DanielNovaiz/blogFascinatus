-- Check if orders table has data
SELECT 
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  MIN(created_at) as first_order,
  MAX(created_at) as last_order
FROM orders;

-- Show recent orders
SELECT 
  customer_email,
  total_amount,
  status,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;
