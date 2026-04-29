-- Fix RLS Policy for Dashboard Data Access
-- This allows the dashboard to read orders data anonymously

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

-- Create policy that allows SELECT for all users (including anon)
CREATE POLICY "Allow anonymous SELECT on orders"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);

-- Verify the fix
SET ROLE anon;
SELECT COUNT(*) as orders_count FROM orders;
RESET ROLE;

-- Check if other tables need similar policies
-- (Dashboard primarily uses orders table for metrics)
