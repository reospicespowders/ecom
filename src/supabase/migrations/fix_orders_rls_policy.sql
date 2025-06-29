-- Fix the RLS policy for orders table - Admin only access
-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Authenticated users can access orders" ON "api"."orders";

-- Create admin-only policy for orders
CREATE POLICY "Admin users can access orders"
ON "api"."orders"
TO public
USING (
  auth.role() = 'authenticated' 
  AND auth.jwt() ->> 'admin_role' = 'admin'
);

-- Enable RLS on orders table if not already enabled
ALTER TABLE "api"."orders" ENABLE ROW LEVEL SECURITY; 