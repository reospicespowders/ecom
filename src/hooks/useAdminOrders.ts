import useSWR from 'swr';
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

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('Admin access required');
    }
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
});

export function useAdminOrders() {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const isAdmin = user?.publicMetadata?.admin_role === 'admin';

  const { data: orders, error, mutate } = useSWR<Order[]>(
    isUserLoaded && isSignedIn && isAdmin ? '/api/orders' : null,
    fetcher
  );

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
      mutate(
        (currentOrders) =>
          currentOrders?.map((order) =>
            order.id === orderId ? { ...order, ...updatedOrder } : order
          ),
        false
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
      mutate(
        (currentOrders) =>
          currentOrders?.map((order) =>
            order.id === orderId ? { ...order, ...updatedOrder } : order
          ),
        false
      );

      return updatedOrder;
    } catch (err) {
      console.error('Error updating payment status:', err);
      throw err;
    }
  };

  return {
    orders: orders || [],
    isLoading: !error && !orders && isUserLoaded && isSignedIn && isAdmin,
    isError: !!error,
    error,
    isAdmin,
    mutate,
    updateOrderStatus,
    updatePaymentStatus,
  };
} 