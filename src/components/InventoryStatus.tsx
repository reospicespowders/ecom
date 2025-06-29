import React from 'react';
import { useRealTimeInventory } from '@/hooks/useRealTimeInventory';

interface InventoryStatusProps {
  productId: string;
  showExactCount?: boolean; // For admin view
}

export function InventoryStatus({ productId, showExactCount = false }: InventoryStatusProps) {
  const { data, loading, error } = useRealTimeInventory(productId);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>;
  }

  if (error || !data) {
    return <span className="text-red-500 text-sm">Stock unavailable</span>;
  }

  const { inventory } = data;

  if (showExactCount) {
    // Admin view - show exact numbers
    return (
      <div className="space-y-1">
        <div className="text-sm">
          <span className="font-medium">In Stock:</span> {inventory.available_stock}
        </div>
        <div className="text-sm text-gray-600">
          <span>Reserved:</span> {inventory.reserved_stock} | 
          <span>Total:</span> {inventory.current_stock}
        </div>
        {inventory.available_stock <= inventory.low_stock_threshold && (
          <div className="text-red-500 text-sm font-medium">⚠️ Low Stock</div>
        )}
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
        return <span className="text-yellow-500">⚡ Limited Stock</span>;
      case 'low':
        return <span className="text-orange-500">⚠️ Only a few left</span>;
      default:
        return <span className="text-red-500">Out of Stock</span>;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {getStatusDisplay()}
    </div>
  );
} 