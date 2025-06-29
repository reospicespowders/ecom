-- Create product_inventory table
CREATE TABLE IF NOT EXISTS api.product_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sanity_product_id TEXT UNIQUE NOT NULL,
  product_title TEXT NOT NULL,
  category TEXT,
  current_stock INTEGER DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  available_stock INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create inventory_movements table for audit trail
CREATE TABLE IF NOT EXISTS api.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES api.product_inventory(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('order', 'manual', 'restore', 'adjustment', 'initial')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  order_id UUID REFERENCES api.orders(id) ON DELETE SET NULL,
  admin_user_id TEXT,
  previous_stock INTEGER,
  new_stock INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_inventory_sanity_id ON api.product_inventory(sanity_product_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_category ON api.product_inventory(category);
CREATE INDEX IF NOT EXISTS idx_product_inventory_stock ON api.product_inventory(current_stock);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON api.inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON api.inventory_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON api.inventory_movements(movement_type);

-- Add trigger to update available_stock
CREATE OR REPLACE FUNCTION api.update_available_stock()
RETURNS TRIGGER AS $$
BEGIN
  NEW.available_stock = NEW.current_stock - NEW.reserved_stock;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_available_stock
  BEFORE UPDATE ON api.product_inventory
  FOR EACH ROW
  EXECUTE FUNCTION api.update_available_stock();

-- Add trigger to update available_stock on insert
CREATE TRIGGER trigger_insert_available_stock
  BEFORE INSERT ON api.product_inventory
  FOR EACH ROW
  EXECUTE FUNCTION api.update_available_stock(); 