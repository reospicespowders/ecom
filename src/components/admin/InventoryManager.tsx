import { useState } from 'react';
import { useRealTimeInventory } from '@/hooks/useRealTimeInventory';

interface InventoryManagerProps {
  productId: string;
}

export function InventoryManager({ productId }: InventoryManagerProps) {
  const { data, loading, error, refetch } = useRealTimeInventory(productId);
  const [adjustment, setAdjustment] = useState('0');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const adjustmentQuantity = parseInt(adjustment, 10);
    
    if (isNaN(adjustmentQuantity) || !data || !data.inventory) return;

    try {
      setIsUpdating(true);
      const newStock = data.inventory.current_stock + adjustmentQuantity;
      
      const response = await fetch(`/api/shop/products?productId=${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_stock: newStock,
          reason: 'Manual adjustment',
          movement_type: adjustmentQuantity > 0 ? 'restock' : 'adjustment'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }
      
      await refetch();
      setAdjustment('0');
      
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (loading) return <div>Loading inventory...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data || !data.inventory) return <div>No inventory data available.</div>;

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-4">Inventory Details</h3>
      
      {/* Stock Levels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-white rounded-lg border">
          <p className="text-sm font-medium text-gray-500">Current Stock</p>
          <p className="text-2xl font-semibold">{data.inventory.current_stock}</p>
        </div>
        <div className="p-3 bg-white rounded-lg border">
          <p className="text-sm font-medium text-gray-500">Reserved</p>
          <p className="text-2xl font-semibold">{data.inventory.reserved_stock}</p>
        </div>
        <div className="p-3 bg-white rounded-lg border">
          <p className="text-sm font-medium text-gray-500">Available</p>
          <p className="text-2xl font-semibold">{data.inventory.available_stock}</p>
        </div>
        <div className="p-3 bg-white rounded-lg border">
          <p className="text-sm font-medium text-gray-500">Low Stock At</p>
          <p className="text-2xl font-semibold">{data.inventory.low_stock_threshold}</p>
        </div>
      </div>

      {/* Manual Adjustment Form */}
      <form onSubmit={handleUpdate} className="mb-6">
        <h4 className="font-semibold mb-2">Adjust Stock</h4>
        <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adjustment Quantity
              </label>
              <input
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="±0"
              />
            </div>
            <button
              type="submit"
              disabled={adjustment === '0' || isUpdating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isUpdating ? 'Updating...' : 'Apply Adjustment'}
            </button>
        </div>
      </form>

      {/* Inventory Movements */}
      <div>
        <h4 className="font-semibold mb-2">Recent Movements</h4>
        <div className="text-sm text-gray-600">
          {(data.inventory as any).inventory_movements?.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {(data.inventory as any).inventory_movements?.slice(0, 5).map((movement: any) => (
                <li key={movement.id} className="py-2">
                  <span>{new Date(movement.created_at).toLocaleString()}:</span>
                  <span className="font-medium"> {movement.quantity_change}</span>
                  <span> ({movement.movement_type})</span>
                  <span className="text-gray-500"> - {movement.reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent movements.</p>
          )}
        </div>
      </div>
    </div>
  );
} 