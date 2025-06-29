-- Create function for updating inventory with movement logging
CREATE OR REPLACE FUNCTION api.update_inventory_with_movement(
  p_product_id UUID,
  p_new_stock INTEGER,
  p_new_threshold INTEGER,
  p_reason TEXT,
  p_admin_user_id TEXT
)
RETURNS TABLE(
  id UUID,
  sanity_product_id TEXT,
  product_title TEXT,
  category TEXT,
  current_stock INTEGER,
  reserved_stock INTEGER,
  available_stock INTEGER,
  low_stock_threshold INTEGER,
  last_updated TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
DECLARE
  v_previous_stock INTEGER;
  v_stock_change INTEGER;
BEGIN
  -- Get current stock
  SELECT current_stock INTO v_previous_stock
  FROM api.product_inventory
  WHERE id = p_product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  -- Calculate stock change
  v_stock_change := p_new_stock - v_previous_stock;
  
  -- Update inventory
  UPDATE api.product_inventory
  SET 
    current_stock = p_new_stock,
    low_stock_threshold = p_new_threshold,
    last_updated = NOW()
  WHERE id = p_product_id;
  
  -- Log movement if stock changed
  IF v_stock_change != 0 THEN
    INSERT INTO api.inventory_movements (
      product_id,
      movement_type,
      quantity,
      reason,
      admin_user_id,
      previous_stock,
      new_stock
    ) VALUES (
      p_product_id,
      'manual',
      v_stock_change,
      p_reason,
      p_admin_user_id,
      v_previous_stock,
      p_new_stock
    );
  END IF;
  
  -- Return updated inventory
  RETURN QUERY
  SELECT 
    pi.id,
    pi.sanity_product_id,
    pi.product_title,
    pi.category,
    pi.current_stock,
    pi.reserved_stock,
    pi.available_stock,
    pi.low_stock_threshold,
    pi.last_updated,
    pi.created_at,
    pi.updated_at
  FROM api.product_inventory pi
  WHERE pi.id = p_product_id;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION api.update_inventory_with_movement(UUID, INTEGER, INTEGER, TEXT, TEXT) TO authenticated; 