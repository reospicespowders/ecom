import { useState, useEffect, useCallback } from 'react';
import { useClerkSupabaseClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface InventoryData {
  id: string;
  sanity_product_id: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  low_stock_threshold: number;
  last_updated: string;
  in_stock?: boolean;
  stock_level?: 'high' | 'medium' | 'low' | 'out_of_stock';
  low_stock?: boolean;
}

interface SanityProduct {
  _id: string;
  title: string;
  price: number;
  sale_price?: number;
  sku?: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  quantity?: number;
  image?: string;
  gallery?: string[];
  description?: string;
  brand?: string;
  status?: string;
  slug?: string;
  unit?: string;
  orderQuantity?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

interface ProductWithInventory {
  product: SanityProduct;
  inventory: InventoryData;
}

export function useRealTimeInventory(productId: string) {
  const [data, setData] = useState<ProductWithInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const supabase = useClerkSupabaseClient();

  // Fetch initial data
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Set up real-time subscription
  useEffect(() => {
    fetchInventory();

    const newChannel = supabase
      .channel(`inventory-${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'api',
          table: 'product_inventory',
          filter: `sanity_product_id=eq.${productId}`
        },
        (payload) => {
          console.log('Real-time inventory update:', payload);
          
          if (payload.eventType === 'UPDATE' && data) {
            const updatedInventory = payload.new as InventoryData;
            setData(prev => prev ? {
              ...prev,
              inventory: {
                ...prev.inventory,
                ...updatedInventory,
                in_stock: updatedInventory.available_stock > 0,
                stock_level: updatedInventory.available_stock > 10 ? 'high' : 
                           updatedInventory.available_stock > 5 ? 'medium' : 
                           updatedInventory.available_stock > 0 ? 'low' : 'out_of_stock',
                low_stock: updatedInventory.current_stock <= updatedInventory.low_stock_threshold
              }
            } : null);
          }
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [productId, supabase, fetchInventory]);

  // Reserve stock function
  const reserveStock = useCallback(async (quantity: number, orderId?: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movement_type: 'reservation',
          quantity,
          order_id: orderId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reserve stock');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }, [productId]);

  // Complete sale function
  const completeSale = useCallback(async (quantity: number, orderId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movement_type: 'sale',
          quantity,
          order_id: orderId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete sale');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }, [productId]);

  // Release reservation function
  const releaseReservation = useCallback(async (quantity: number, orderId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movement_type: 'release',
          quantity,
          order_id: orderId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to release reservation');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }, [productId]);

  return {
    data,
    loading,
    error,
    refetch: fetchInventory,
    reserveStock,
    completeSale,
    releaseReservation,
    isConnected: channel?.state === 'joined'
  };
}

// Hook for multiple products (e.g., for product listing pages)
export function useRealTimeInventoryList(productIds: string[]) {
  const [inventoryData, setInventoryData] = useState<Record<string, InventoryData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useClerkSupabaseClient();

  useEffect(() => {
    if (productIds.length === 0) return;

    // Fetch initial data for all products
    const fetchAllInventory = async () => {
      try {
        setLoading(true);
        const promises = productIds.map(id => 
          fetch(`/api/products/${id}`).then(res => res.json())
        );
        
        const results = await Promise.all(promises);
        const inventoryMap: Record<string, InventoryData> = {};
        
        results.forEach((result, index) => {
          if (result.inventory) {
            inventoryMap[productIds[index]] = result.inventory;
          }
        });
        
        setInventoryData(inventoryMap);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
      } finally {
        setLoading(false);
      }
    };

    fetchAllInventory();

    // Set up real-time subscription for all products
    const channel = supabase
      .channel('inventory-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'api',
          table: 'product_inventory',
          filter: `sanity_product_id=in.(${productIds.join(',')})`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedInventory = payload.new as InventoryData;
            setInventoryData(prev => ({
              ...prev,
              [updatedInventory.sanity_product_id]: {
                ...updatedInventory,
                in_stock: updatedInventory.available_stock > 0,
                stock_level: updatedInventory.available_stock > 10 ? 'high' : 
                           updatedInventory.available_stock > 5 ? 'medium' : 
                           updatedInventory.available_stock > 0 ? 'low' : 'out_of_stock',
                low_stock: updatedInventory.current_stock <= updatedInventory.low_stock_threshold
              }
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productIds, supabase]);

  return {
    inventoryData,
    loading,
    error,
    getInventoryForProduct: (productId: string) => inventoryData[productId]
  };
}

// Hook for product listing with inventory
export function useProductsWithInventory(filters?: {
  search?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  const supabase = useClerkSupabaseClient();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.lowStock) params.append('lowStock', 'true');
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setProducts(result.products || []);
      setPagination(result.pagination);
      setStats(result.stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    stats,
    refetch: fetchProducts
  };
} 