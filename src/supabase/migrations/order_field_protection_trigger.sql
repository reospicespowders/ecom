-- Create a function to check field updates
CREATE OR REPLACE FUNCTION check_order_field_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is admin, allow all updates
  IF (auth.jwt() ->> 'admin_role') = 'admin' THEN
    RETURN NEW;
  END IF;
  
  -- For non-admin users, prevent updates to critical fields
  IF OLD.status != NEW.status THEN
    RAISE EXCEPTION 'Customers cannot update order status';
  END IF;
  
  IF OLD.payment_status != NEW.payment_status THEN
    RAISE EXCEPTION 'Customers cannot update payment status';
  END IF;
  
  IF OLD.total_amount != NEW.total_amount THEN
    RAISE EXCEPTION 'Customers cannot update total amount';
  END IF;
  
  IF OLD.subtotal != NEW.subtotal THEN
    RAISE EXCEPTION 'Customers cannot update subtotal';
  END IF;
  
  IF OLD.shipping_amount != NEW.shipping_amount THEN
    RAISE EXCEPTION 'Customers cannot update shipping amount';
  END IF;
  
  IF OLD.tax_amount != NEW.tax_amount THEN
    RAISE EXCEPTION 'Customers cannot update tax amount';
  END IF;
  
  IF OLD.discount_amount != NEW.discount_amount THEN
    RAISE EXCEPTION 'Customers cannot update discount amount';
  END IF;
  
  -- Allow updates to non-critical fields
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS check_order_field_updates_trigger ON api.orders;
CREATE TRIGGER check_order_field_updates_trigger
  BEFORE UPDATE ON api.orders
  FOR EACH ROW
  EXECUTE FUNCTION check_order_field_updates(); 