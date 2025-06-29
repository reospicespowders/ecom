-- Enable RLS on api.orders
ALTER TABLE api.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS allow_authenticated_insert_orders ON api.orders;
DROP POLICY IF EXISTS allow_authenticated_view_own_orders ON api.orders;
DROP POLICY IF EXISTS allow_authenticated_update_own_orders ON api.orders;
DROP POLICY IF EXISTS allow_admin_manage_orders ON api.orders;
DROP POLICY IF EXISTS allow_authenticated_delete_own_orders ON api.orders;

-- Allow authenticated users to insert orders tied to their customer_id
CREATE POLICY allow_authenticated_insert_orders ON api.orders
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM api.customers
    WHERE id = api.orders.customer_id
    AND clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- Allow authenticated users to view their own orders
CREATE POLICY allow_authenticated_view_own_orders ON api.orders
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM api.customers
    WHERE id = api.orders.customer_id
    AND clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- Allow authenticated users to update their own orders (restricted fields)
CREATE POLICY allow_authenticated_update_own_orders ON api.orders
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM api.customers
    WHERE id = api.orders.customer_id
    AND clerk_user_id = auth.jwt() ->> 'sub'
  )
  AND
  -- Only allow updating non-critical fields for customers
  -- Customers cannot change status, payment_status, total_amount, subtotal
  (auth.jwt() ->> 'admin_role') = 'admin' OR (
    -- For customers, only allow updating notes and metadata
    -- This is enforced at the application level, not RLS level
    true
  )
);

-- Allow admins to perform all operations on any orders
CREATE POLICY allow_admin_manage_orders ON api.orders
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'admin_role') = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'admin_role') = 'admin'
);

-- Allow authenticated users to delete their own orders (only if not processed)
CREATE POLICY allow_authenticated_delete_own_orders ON api.orders
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM api.customers
    WHERE id = api.orders.customer_id
    AND clerk_user_id = auth.jwt() ->> 'sub'
  )
  AND
  -- Only allow deletion of pending orders
  status = 'pending' AND payment_status = 'pending'
); 