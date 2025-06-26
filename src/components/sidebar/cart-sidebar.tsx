"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from '@clerk/nextjs';
import { getProductById } from '@/lib/sanity.fetch';
import { IProductData } from '@/types/product-d-t';
import empty_cart_img from "@/assets/img/cart/empty-cart.png";

// props 
type IProps = {
  isCartSidebarOpen: boolean;
  setIsCartSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CartItem {
  id: number;
  product_id: string;
  quantity: number;
}

interface CartItemWithProduct extends CartItem {
  product: IProductData;
}

const CartSidebar = ({isCartSidebarOpen,setIsCartSidebarOpen}:IProps) => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const { session } = useSession();

  const fetchCartItems = useCallback(async () => {
    if (!session) return;
    
    try {
      setLoading(true);
      const token = await session.getToken();
      const response = await fetch('/api/cart', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      });
      
      if (response.ok) {
        const cartData = await response.json();
        
        const itemsWithProducts = await Promise.all(
          cartData.map(async (item: CartItem) => {
            const product = await getProductById(item.product_id);
            return { ...item, product };
          })
        );
        
        setCartItems(itemsWithProducts);
        
        // Calculate total
        const newTotal = itemsWithProducts.reduce((acc, item) => {
          const price = item.product.sale_price ?? item.product.price;
          return acc + price * item.quantity;
        }, 0);
        setTotal(newTotal);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (isCartSidebarOpen) {
      fetchCartItems();
    }
  }, [session, isCartSidebarOpen, fetchCartItems]);

  const handleRemoveItem = async (itemId: number) => {
    if (!session) return;
    
    try {
      const token = await session.getToken();
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      });
      
      if (response.ok) {
        fetchCartItems(); // Refresh cart
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <>
      <div 
       className={`tpcartinfo tp-cart-info-area p-relative ${isCartSidebarOpen ? "tp-sidebar-opened" : ""}`}>
        <button className="tpcart__close" onClick={() => setIsCartSidebarOpen(false)}>
          <i className="icon-x"></i>
        </button>

          <div className="tpcart">
            <h4 className="tpcart__title">Your Cart</h4>
            {/* if no item in cart */}
            {!loading && cartItems.length === 0 && (
              <div className="cartmini__empty text-center pt-100">
                <Image src={empty_cart_img} alt="empty-cart-img" />
                <p>Your Cart is empty</p>
                <Link href="/shop" className="tp-btn-2 mt-10">
                  Go to Shop
                </Link>
              </div>
            )}
            {loading && (
              <div className="text-center pt-50">
                <p>Loading cart...</p>
              </div>
            )}
            {!loading && cartItems.length > 0 && (
            <div className="tpcart__product">
              <div className="tpcart__product-list">
                <ul>
                  {cartItems.map((item) => (
                    <li key={item.id}>
                      <div className="tpcart__item">
                        <div className="tpcart__img">
                          <Image
                            src={item.product.image}
                            alt="cart-img"
                            width={70}
                            height={70}
                          />
                          <div className="tpcart__del">
                            <a className="pointer" onClick={() => handleRemoveItem(item.id)}>
                              <i className="icon-x-circle"></i>
                            </a>
                          </div>
                        </div>
                        <div className="tpcart__content">
                          <span className="tpcart__content-title">
                            <Link href={`/shop/${item.product.category?.slug?.current || 'uncategorized'}/${item.product.slug}`}>{item.product.title}</Link>
                          </span>
                          <div className="tpcart__cart-price">
                            <span className="quantity">
                              {item.quantity} x {" "}
                            </span>
                            <span className="new-price">
                              ${(item.product.sale_price ?? item.product.price) * item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="tpcart__checkout">
                <div className="tpcart__total-price d-flex justify-content-between align-items-center">
                  <span> Subtotal:</span>
                  <span className="heilight-price"> ${total.toFixed(2)}</span>
                </div>
                <div className="tpcart__checkout-btn">
                  <Link className="tpcart-btn mb-10" href="/cart">
                    View Cart
                  </Link>
                  <Link className="tpcheck-btn" href="/checkout">
                    Checkout
                  </Link>
                </div>
              </div>
              <div className="tpcart__free-shipping text-center">
                <span>
                  Free shipping for orders <b>under 10km</b>
                </span>
              </div>
            </div>
            )}
          </div>
      </div>
      <div onClick={() => setIsCartSidebarOpen(false)} className={`cartbody-overlay ${isCartSidebarOpen ? "opened" : ""}`}></div>
    </>
  );
};

export default CartSidebar;
