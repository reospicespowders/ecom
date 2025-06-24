'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@clerk/nextjs';
import { useClerkSupabaseClient } from '@/utils/supabase/client';
import { getProductById, IProduct } from '@/lib/sanity.fetch';

interface CartItem {
  id: number;
  product_id: string;
  quantity: number;
}

interface CartItemWithProduct extends CartItem {
  product: IProduct;
}

const CheckoutArea = () => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const router = useRouter();
  const { session } = useSession();
  const supabase = useClerkSupabaseClient();

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
    if (!session) return;

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
          <div className="row">
            <div className="col-lg-6">
              <div className="checkbox-form">
                <h3>Billing Details</h3>
                <div className="row">
                  {/* Form fields for billing details */}
                  <div className="col-md-12">
                    <div className="checkout-form-list">
                      <label>Full Name <span className="required">*</span></label>
                      <input type="text" name="name" placeholder="Full Name" required onChange={handleInputChange} />
                    </div>
                  </div>
                  {/* ... other form fields (email, phone, address, etc.) */}
                  <div className="col-md-6">
                                        <div className="checkout-form-list">
                                            <label>Email Address <span className="required">*</span></label>
                                            <input type="email" name="email" placeholder="" required onChange={handleInputChange}/>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="checkout-form-list">
                                            <label>Phone <span className="required">*</span></label>
                                            <input type="text" name="phone" placeholder="Street address" required onChange={handleInputChange}/>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="checkout-form-list">
                                            <label>Address <span className="required">*</span></label>
                                            <input type="text" name="address" placeholder="Street address" required onChange={handleInputChange}/>
                                        </div>
                                    </div>
                                   
                                    <div className="col-md-12">
                                        <div className="checkout-form-list">
                                           <label>Town / City <span className="required">*</span></label>
                                            <input type="text" name="city" placeholder="Town / City" required onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="checkout-form-list">
                                            <label>Postcode / Zip <span className="required">*</span></label>
                                            <input type="text" name="zip" placeholder="Postcode / Zip" required onChange={handleInputChange} />
                                        </div>
                                    </div>
                  <div className="col-md-12">
                    <div className="checkout-form-list create-acc">
                      <input id="cbox" type="checkbox" />
                      <label htmlFor="cbox">Create an account?</label>
                    </div>
                  </div>
                </div>
                <div className="order-notes">
                  <div className="checkout-form-list">
                    <label>Order Notes</label>
                    <textarea id="checkout-mess" name="notes" cols={30} rows={10} placeholder="Notes about your order, e.g. special notes for delivery." onChange={handleInputChange}></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="your-order mb-30 ">
                <h3>Your order</h3>
                <div className="your-order-table table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th className="product-name">Product</th>
                        <th className="product-total">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map(item => (
                        <tr key={item.id} className="cart_item">
                          <td className="product-name">
                            {item.product.name} <strong className="product-quantity"> × {item.quantity}</strong>
                          </td>
                          <td className="product-total">
                            <span className="amount">${(item.product.sale_price ?? item.product.price) * item.quantity}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="cart-subtotal">
                        <th>Cart Subtotal</th>
                        <td><span className="amount">${subtotal.toFixed(2)}</span></td>
                      </tr>
                      <tr className="order-total">
                        <th>Order Total</th>
                        <td><strong><span className="amount">${subtotal.toFixed(2)}</span></strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="payment-method">
                  <div className="accordion" id="checkoutAccordion">
                    {/* Payment method options */}
                  </div>
                  <div className="order-button-payment mt-20">
                    <button type="submit" className="tp-btn-2">Place order</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CheckoutArea; 