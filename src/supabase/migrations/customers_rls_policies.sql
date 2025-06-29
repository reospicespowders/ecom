-- Enable RLS on api.customers
ALTER TABLE api.customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS allow_authenticated_insert_customers ON api.customers;
DROP POLICY IF EXISTS allow_authenticated_view_own_customer ON api.customers;
DROP POLICY IF EXISTS allow_authenticated_update_own_customer ON api.customers;
DROP POLICY IF EXISTS allow_admin_manage_customers ON api.customers;
DROP POLICY IF EXISTS allow_authenticated_delete_own_customer ON api.customers;

-- Allow authenticated users to insert their own customer profile
CREATE POLICY allow_authenticated_insert_customers ON api.customers
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  clerk_user_id = auth.jwt() ->> 'sub'
);

-- Allow authenticated users to view their own customer profile
CREATE POLICY allow_authenticated_view_own_customer ON api.customers
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  clerk_user_id = auth.jwt() ->> 'sub'
);

-- Allow authenticated users to update their own customer profile
CREATE POLICY allow_authenticated_update_own_customer ON api.customers
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  clerk_user_id = auth.jwt() ->> 'sub'
)
WITH CHECK (
  clerk_user_id = auth.jwt() ->> 'sub'
);

-- Allow admins to perform all operations on any customers
CREATE POLICY allow_admin_manage_customers ON api.customers
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'admin_role') = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'admin_role') = 'admin'
);

-- Allow authenticated users to delete their own customer profile
CREATE POLICY allow_authenticated_delete_own_customer ON api.customers
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
  clerk_user_id = auth.jwt() ->> 'sub'
); 