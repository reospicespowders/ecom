import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_title: string;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
}

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
  customer: Customer;
  order_items?: OrderItem[];
}

export function useAdminOrders() {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (isUserLoaded && isSignedIn && user) {
      const adminRole = user.publicMetadata?.admin_role;
      setIsAdmin(adminRole === 'admin');
    } else {
      setIsAdmin(false);
    }
  }, [isUserLoaded, isSignedIn, user]);

  // Fetch orders (admin only)
  const fetchOrders = useCallback(async () => {
    if (!isAdmin) {
      setError('Admin access required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/orders');
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Admin access required');
        }
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const ordersData = await response.json();
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  // Update order status
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update order: ${response.statusText}`);
      }

      const updatedOrder = await response.json();
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, ...updatedOrder } : order
        )
      );

      return updatedOrder;
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  // Update payment status
  const updatePaymentStatus = async (orderId: string, paymentStatus: Order['payment_status']) => {
    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: paymentStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update payment status: ${response.statusText}`);
      }

      const updatedOrder = await response.json();
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, ...updatedOrder } : order
        )
      );

      return updatedOrder;
    } catch (err) {
      console.error('Error updating payment status:', err);
      throw err;
    }
  };

  // Fetch orders when component mounts and user is admin
  useEffect(() => {
    if (isUserLoaded && isAdmin) {
      fetchOrders();
    } else if (isUserLoaded && !isAdmin) {
      setIsLoading(false);
      setError('Admin access required');
    }
  }, [isUserLoaded, isAdmin, fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    isAdmin,
    fetchOrders,
    updateOrderStatus,
    updatePaymentStatus,
  };
} 