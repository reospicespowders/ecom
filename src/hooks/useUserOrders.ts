import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  currency: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  order_date: string;
  shipped_date: string | null;
  delivered_date: string | null;
  shipping_address: any;
  billing_address: any;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string | null;
  notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function useUserOrders() {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's orders
  const fetchOrders = useCallback(async () => {
    if (!isSignedIn || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/orders/user');
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const ordersData = await response.json();
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching user orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user]);

  // Fetch orders when component mounts and user is signed in
  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      fetchOrders();
    } else if (isUserLoaded && !isSignedIn) {
      setIsLoading(false);
      setOrders([]);
    }
  }, [isUserLoaded, isSignedIn, fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
  };
} 