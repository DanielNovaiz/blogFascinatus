-- Check RLS policies on orders table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'orders';

-- Test direct query as anon role (simulating what the app does)
SET ROLE anon;
SELECT COUNT(*) FROM orders;
RESET ROLE;
