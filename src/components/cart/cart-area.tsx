'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CartItem from './cart-item';
import { IProductData } from '@/types/product-d-t';
import { getProductById } from '@/lib/sanity.fetch'; 

const CartArea = () => {
  const [cartItems, setCartItems] = useState<IProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  async function fetchCartDetails() {
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }
      const cartData = await response.json();

      const productDetailsPromises = cartData.map(async (item: any) => {
        const product = await getProductById(item.product_id);
        return { ...product, orderQuantity: item.quantity, cartId: item.id };
      });

      const resolvedProducts = await Promise.all(productDetailsPromises);
      setCartItems(resolvedProducts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCartDetails();
  }, []);
  
  useEffect(() => {
    const newTotal = cartItems.reduce((acc, item) => {
      const price = item.sale_price ?? item.price;
      return acc + price * (item.orderQuantity || 1);
    }, 0);
    setTotal(newTotal);
  }, [cartItems]);

  const handleClearCart = async () => {
    try {
      const response = await fetch('/api/cart', { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to clear cart');
      setCartItems([]);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-center pt-100 pb-100">Loading...</div>;
  }

  return (
    <section className="cart-area pb-80">
      <div className="container">
        <div className="row">
          <div className="col-12">
            {cartItems.length === 0 && (
              <div className="text-center pt-100">
                <h3>Your cart is empty</h3>
                <Link href="/shop" className="tp-btn-2 mt-10">
                  Return to shop
                </Link>
              </div>
            )}
            {cartItems.length > 0 && (
              <div>
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
                        <CartItem key={item._id} product={item} onUpdate={fetchCartDetails} />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="coupon-all">
                      <div className="coupon">
                        <input
                          id="coupon_code"
                          className="input-text"
                          name="coupon_code"
                          placeholder="Coupon code"
                          type="text"
                        />
                        <button
                          className="tp-btn tp-color-btn banner-animation"
                          name="apply_coupon"
                          type="submit"
                        >
                          Apply Coupon
                        </button>
                      </div>
                      <div className="coupon2">
                        <button
                          onClick={handleClearCart}
                          className="tp-btn tp-color-btn banner-animation"
                          name="update_cart"
                          type="button"
                        >
                          Clear cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row justify-content-end">
                  <div className="col-md-5 ">
                    <div className="cart-page-total">
                      <h2>Cart totals</h2>
                      <ul className="mb-20">
                        <li>
                          Subtotal <span>${total.toFixed(2)}</span>
                        </li>
                        <li>
                          Total <span>${total.toFixed(2)}</span>
                        </li>
                      </ul>
                      <Link
                        href="/checkout"
                        className="tp-btn tp-color-btn banner-animation"
                      >
                        Proceed to Checkout
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartArea;