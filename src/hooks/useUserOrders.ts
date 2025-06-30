import useSWR from 'swr';
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

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
});

export function useUserOrders() {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  
  const { data: orders, error, mutate } = useSWR<Order[]>(
    isUserLoaded && isSignedIn ? '/api/orders/user' : null,
    fetcher
  );

  return {
    orders: orders || [],
    isLoading: !error && !orders && isUserLoaded && isSignedIn,
    isError: !!error,
    error,
    mutate,
  };
} 