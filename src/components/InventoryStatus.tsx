import React from 'react';
import { InventoryData } from '@/hooks/useRealTimeInventory'; // Assuming type is exported

interface InventoryStatusProps {
  inventory: InventoryData | null;
  showExactCount?: boolean; // For admin view
}

export function InventoryStatus({ inventory, showExactCount = false }: InventoryStatusProps) {
  if (!inventory) {
    return (
      <div className="text-sm font-semibold text-gray-500">
        Inventory not tracked
      </div>
    );
  }

  // Admin view - show exact counts
  if (showExactCount) {
    return (
      <div className="text-left text-xs">
        <div className="space-y-1">
          <div className="text-sm">
            <span className="font-medium">In Stock:</span> {inventory.available_stock}
          </div>
          <div className="text-sm text-gray-600">
            <span>Reserved:</span> {inventory.reserved_stock} | 
            <span>Total:</span> {inventory.current_stock}
          </div>
          {inventory.low_stock && (
            <div className="text-red-500 text-sm font-medium">⚠️ Low Stock</div>
          )}
        </div>
      </div>
    );
  }

  // Customer view - show stock level indicators
  const getStatusDisplay = () => {
    if (!inventory.in_stock) {
      return <span className="text-red-500 font-medium">Out of Stock</span>;
    }

    switch (inventory.stock_level) {
      case 'high':
        return <span className="text-green-500">✓ In Stock</span>;
      case 'medium':
        return <span className="text-yellow-600">Low Stock</span>;
      case 'low':
        return <span className="text-orange-500">Very Low Stock</span>;
      default:
        return <span className="text-gray-500">Checking...</span>;
    }
  };

  return <div className="text-sm font-medium">{getStatusDisplay()}</div>;
} 