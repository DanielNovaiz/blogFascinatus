-- Fix RLS policy to allow anonymous SELECT on orders table
-- This allows the dashboard to read order data

-- Create a policy that allows SELECT for all users (including anon)
CREATE POLICY "Allow anonymous SELECT on orders"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);

-- Alternative: Drop the restrictive policy and recreate it
-- (commented out - use if needed)
-- DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
-- CREATE POLICY "Allow all to view orders"
-- ON public.orders
-- FOR SELECT
-- TO public
-- USING (true);

-- Verify the fix
SET ROLE anon;
SELECT COUNT(*) FROM orders;
RESET ROLE;
