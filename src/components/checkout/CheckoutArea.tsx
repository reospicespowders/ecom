'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@clerk/nextjs';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { getProductById } from '@/lib/sanity.fetch';
import { IProductData } from '@/types/product-d-t';

interface CartItem {
  id: number;
  product_id: string;
  quantity: number;
}

interface CartItemWithProduct extends CartItem {
  product: IProductData;
}

const CheckoutArea = () => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const router = useRouter();
  const { session } = useSession();
  const supabase = useSupabase();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    notes: ''
  });

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!session || !supabase) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/cart', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (response.status !== 200) throw new Error(data.error || 'Failed to fetch cart items');
        
        const itemsWithProducts = await Promise.all(
          data.map(async (item: CartItem) => {
            const product = await getProductById(item.product_id);
            return { ...item, product };
          })
        );

        setCartItems(itemsWithProducts);

        const newSubtotal = itemsWithProducts.reduce((acc, item) => {
          const price = item.product.sale_price ?? item.product.price;
          return acc + price * item.quantity;
        }, 0);
        setSubtotal(newSubtotal);

      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [session, supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session || !supabase) return;

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDetails: {
            ...formData,
            total_price: subtotal,
            status: 'pending',
          }
        }),
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push(`/order-success?orderId=${result.orderId}`);
      } else {
        alert('Failed to place order: ' + result.error);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An unexpected error occurred.');
    }
  };

  if (loading) {
    return <div>Loading your checkout details...</div>;
  }

  return (
    <section className="checkout-area pt-120 pb-120">
      <div className="container">
        <form onSubmit={handleSubmit}>
          {/* ... JSX for the form ... */}
        </form>
      </div>
    </section>
  );
};

export default CheckoutArea;