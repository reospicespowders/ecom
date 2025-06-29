import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface InventoryProduct {
  id: string;
  sanity_product_id: string;
  product_title: string;
  category: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  low_stock_threshold: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

interface InventoryMovement {
  id: string;
  product_id: string;
  movement_type: 'order' | 'manual' | 'restore' | 'adjustment' | 'initial';
  quantity: number;
  reason: string;
  order_id?: string;
  admin_user_id: string;
  previous_stock: number;
  new_stock: number;
  created_at: string;
  product_inventory?: {
    id: string;
    product_title: string;
    category: string;
  };
}

interface InventoryFilters {
  category?: string;
  lowStock?: boolean;
  search?: string;
}

export function useInventory() {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filters, setFilters] = useState<InventoryFilters>({});

  // Check if user is admin
  useEffect(() => {
    if (isUserLoaded && isSignedIn && user) {
      const adminRole = user.publicMetadata?.admin_role;
      setIsAdmin(adminRole === 'admin');
    } else {
      setIsAdmin(false);
    }
  }, [isUserLoaded, isSignedIn, user]);

  // Fetch inventory data
  const fetchInventory = useCallback(async (filters: InventoryFilters = {}) => {
    if (!isAdmin) {
      setError('Admin access required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.lowStock) params.append('lowStock', 'true');
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/inventory?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Admin access required');
        }
        throw new Error(`Failed to fetch inventory: ${response.statusText}`);
      }

      const inventoryData = await response.json();
      setInventory(inventoryData);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  // Update product stock
  const updateProductStock = async (productId: string, updates: {
    current_stock: number;
    low_stock_threshold?: number;
    reason?: string;
  }) => {
    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    try {
      const response = await fetch(`/api/inventory/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update product: ${response.statusText}`);
      }

      const updatedProduct = await response.json();
      
      // Update local state
      setInventory(prevInventory => 
        prevInventory.map(product => 
          product.id === productId ? { ...product, ...updatedProduct } : product
        )
      );

      return updatedProduct;
    } catch (err) {
      console.error('Error updating product stock:', err);
      throw err;
    }
  };

  // Bulk update inventory
  const bulkUpdateInventory = async (products: any[]) => {
    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk update inventory: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Refresh inventory data
      await fetchInventory(filters);

      return result;
    } catch (err) {
      console.error('Error bulk updating inventory:', err);
      throw err;
    }
  };

  // Apply filters
  const applyFilters = useCallback((newFilters: InventoryFilters) => {
    setFilters(newFilters);
    fetchInventory(newFilters);
  }, [fetchInventory]);

  // Get inventory stats
  const getInventoryStats = useCallback(() => {
    const totalProducts = inventory.length;
    const lowStockProducts = inventory.filter(product => 
      product.current_stock <= product.low_stock_threshold
    ).length;
    const outOfStockProducts = inventory.filter(product => 
      product.current_stock === 0
    ).length;
    const totalStock = inventory.reduce((sum, product) => sum + product.current_stock, 0);

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStock,
    };
  }, [inventory]);

  // Get categories
  const getCategories = useCallback(() => {
    const categories = [...new Set(inventory.map(product => product.category))];
    return categories.filter(Boolean).sort();
  }, [inventory]);

  // Fetch inventory when component mounts and user is admin
  useEffect(() => {
    if (isUserLoaded && isAdmin) {
      fetchInventory(filters);
    } else if (isUserLoaded && !isAdmin) {
      setIsLoading(false);
      setError('Admin access required');
    }
  }, [isUserLoaded, isAdmin, fetchInventory, filters]);

  return {
    inventory,
    isLoading,
    error,
    isAdmin,
    filters,
    fetchInventory,
    updateProductStock,
    bulkUpdateInventory,
    applyFilters,
    getInventoryStats,
    getCategories,
  };
} 