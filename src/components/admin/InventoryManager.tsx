import React, { useState } from 'react';
import { useRealTimeInventory } from '@/hooks/useRealTimeInventory';

interface InventoryManagerProps {
  productId: string;
}

export function InventoryManager({ productId }: InventoryManagerProps) {
  const { data, loading, error } = useRealTimeInventory(productId);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStockAdjustment = async () => {
    if (!data || adjustmentQuantity === 0) return;

    try {
      setIsUpdating(true);
      
      const newStock = data.inventory.current_stock + adjustmentQuantity;
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_stock: newStock,
          reason: reason || 'Manual adjustment',
          movement_type: adjustmentQuantity > 0 ? 'restock' : 'adjustment'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }

      setAdjustmentQuantity(0);
      setReason('');
      
    } catch (error) {
      console.error('Failed to update inventory:', error);
      alert('Failed to update inventory. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div>Loading inventory manager...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No inventory data found</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Inventory Management</h3>
      
      {/* Current Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm text-gray-600">Current Stock</div>
          <div className="text-2xl font-bold text-blue-600">
            {data.inventory.current_stock}
          </div>
        </div>
        <div className="bg-yellow-50 p-3 rounded">
          <div className="text-sm text-gray-600">Reserved</div>
          <div className="text-2xl font-bold text-yellow-600">
            {data.inventory.reserved_stock}
          </div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-sm text-gray-600">Available</div>
          <div className="text-2xl font-bold text-green-600">
            {data.inventory.available_stock}
          </div>
        </div>
        <div className="bg-red-50 p-3 rounded">
          <div className="text-sm text-gray-600">Low Stock Threshold</div>
          <div className="text-2xl font-bold text-red-600">
            {data.inventory.low_stock_threshold}
          </div>
        </div>
      </div>

      {/* Stock Adjustment */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Adjust Stock</h4>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adjustment Quantity
            </label>
            <input
              type="number"
              value={adjustmentQuantity}
              onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="±0"
            />
            <div className="text-xs text-gray-500 mt-1">
              Use + for increase, - for decrease
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., Received new shipment, Damaged goods"
            />
          </div>
          
          <button
            onClick={handleStockAdjustment}
            disabled={adjustmentQuantity === 0 || isUpdating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>

      {/* Recent Movements */}
      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium mb-3">Recent Movements</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {(data.inventory as any).inventory_movements?.slice(0, 5).map((movement: any) => (
            <div key={movement.id} className="flex justify-between text-sm">
              <span className="capitalize">{movement.movement_type}</span>
              <span className={movement.quantity >= 0 ? 'text-green-600' : 'text-red-600'}>
                {movement.quantity >= 0 ? '+' : ''}{movement.quantity}
              </span>
              <span className="text-gray-500">
                {new Date(movement.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 