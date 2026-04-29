-- Check if RPC function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'get_daily_sales_metrics';

-- Test the RPC function directly
SELECT * FROM get_daily_sales_metrics(90);
