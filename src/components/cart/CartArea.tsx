'use client';
import { useSession } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useClerkSupabaseClient } from '@/utils/supabase/client';
import { getProductById, IProduct } from '@/lib/sanity.fetch';
import CartItem from './CartItem';

interface ICartItem {
  id: number;
  product_id: string;
  quantity: number;
}

export interface ICartItemWithProduct extends ICartItem {
  product: IProduct;
}

const CartArea = () => {
  const [cartItems, setCartItems] = useState<ICartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useSession();
  const supabase = useClerkSupabaseClient();

  const fetchCartItems = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const response = await fetch('/api/cart', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.status !== 200) throw new Error(data.error || 'Failed to fetch cart items');
      
      const itemsWithProducts = await Promise.all(
        data.map(async (item: ICartItem) => {
          const product = await getProductById(item.product_id);
          return { ...item, product };
        })
      );
      setCartItems(itemsWithProducts);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [session]);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (!session) return;
    try {
      await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
        credentials: 'include',
      });
      fetchCartItems(); // Re-fetch to update state
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!session) return;
    try {
      await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchCartItems(); // Re-fetch to update state
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };
  
  const handleClearCart = async () => {
    if (!session) return;
    try {
        await fetch('/api/cart', {
          method: 'DELETE',
          credentials: 'include',
        });
        fetchCartItems(); // Re-fetch to update state
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
};

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product.sale_price ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);

  if (loading) {
    return <div>Loading cart...</div>;
  }

  return (
    <section className="cart-area pt-120 pb-120">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <form>
              <div className="table-content table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="product-thumbnail">Images</th>
                      <th className="cart-product-name">Product</th>
                      <th className="product-price">Unit Price</th>
                      <th className="product-quantity">Quantity</th>
                      <th className="product-subtotal">Total</th>
                      <th className="product-remove">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="coupon-all">
                    <div className="coupon">
                      <input id="coupon_code" className="input-text" name="coupon_code"
                        placeholder="Coupon code" type="text" />
                      <button className="tp-btn-2" name="apply_coupon" type="submit">Apply
                        coupon</button>
                    </div>
                    <div className="coupon2">
                      <button className="tp-btn-2" type="button" onClick={handleClearCart}>Clear cart</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row justify-content-end">
                <div className="col-md-5">
                  <div className="cart-page-total">
                    <h2>Cart totals</h2>
                    <ul className="mb-20">
                      <li>Subtotal<span>${subtotal.toFixed(2)}</span></li>
                      <li>Total<span>${subtotal.toFixed(2)}</span></li>
                    </ul>
                    <Link className="tp-btn-2" href="/checkout">Proceed to checkout</Link>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartArea; 