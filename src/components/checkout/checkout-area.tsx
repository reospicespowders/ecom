'use client'
import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ErrorMsg from '../common/error-msg';
import { IProductData } from '@/types/product-d-t';
import { getProductById } from '@/lib/sanity.fetch';
import { useCustomerCheckout } from '@/hooks/useCustomerCheckout';
import { useUser } from '@clerk/nextjs';

type FormData = {
   firstName: string;
   lastName: string;
   company?: string;
   country: string;
   address: string;
   city: string;
   apartment?: string;
   state: string;
   zipCode: string;
   email: string;
   phone: string;
   orderNote?: string;
 };
 
 const schema = yup.object().shape({
   firstName: yup.string().required().label("First Name"),
   lastName: yup.string().required().label("Last Name"),
   company: yup.string().optional().label("Company"),
   country: yup.string().required().label("Country"),
   address: yup.string().required().label("Address"),
   city: yup.string().required().label("City"),
   apartment: yup.string().optional().label("Apartment"),
   state: yup.string().required().label("State"),
   zipCode: yup.string().required().label("Zip Code"),
   email: yup.string().required().email().label("Email"),
   phone: yup.string().required().min(4).label("Phone"),
   orderNote: yup.string().optional().label("Order Note"),
 });

const CheckoutArea = () => {
   const [cartItems, setCartItems] = useState<IProductData[]>([]);
   const [loading, setLoading] = useState(true);
   const [total, setTotal] = useState(0);
   const [shipCost, setShipCost] = useState<number | string>(7.00);
   const [placingOrder, setPlacingOrder] = useState(false);
   const router = useRouter();

   // Customer profile integration
   const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
   const { 
     customerProfile, 
     isLoading: isCustomerLoading, 
     error: customerError,
     createOrUpdateProfile,
     getFormDataFromProfile,
     hasProfile 
   } = useCustomerCheckout();

   async function fetchCartDetails() {
      try {
         const response = await fetch('/api/cart');
         if (!response.ok) throw new Error('Failed to fetch cart items');
         const cartData = await response.json();
         const productDetailsPromises = cartData.map(async (item: any) => {
            const product = await getProductById(item.product_id);
            return { ...product, orderQuantity: item.quantity };
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
 
   const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<FormData>({
     resolver: yupResolver(schema),
   });

   // Auto-populate form with customer profile data
   useEffect(() => {
     if (hasProfile && customerProfile && !isCustomerLoading) {
       const formData = getFormDataFromProfile();
       Object.entries(formData).forEach(([key, value]) => {
         if (value) {
           setValue(key as keyof FormData, value);
         }
       });
     }
   }, [hasProfile, customerProfile, isCustomerLoading, setValue, getFormDataFromProfile]);

   // Auto-populate email from Clerk user data
   useEffect(() => {
     if (isUserLoaded && isSignedIn && user && !hasProfile) {
       const email = user.emailAddresses?.[0]?.emailAddress;
       const firstName = user.firstName;
       const lastName = user.lastName;
       
       if (email) setValue('email', email);
       if (firstName) setValue('firstName', firstName);
       if (lastName) setValue('lastName', lastName);
     }
   }, [isUserLoaded, isSignedIn, user, hasProfile, setValue]);

   const onSubmit = handleSubmit(async (data) => {
      setPlacingOrder(true);
      try {
         // Create or update customer profile first
         let customerProfile = null;
         try {
            customerProfile = await createOrUpdateProfile(data);
         } catch (profileError) {
            console.error('Error creating/updating customer profile:', profileError);
            // Continue with order even if profile creation fails
         }

         // Place order with customer data
         const response = await fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
               orderDetails: { 
                  shipping_cost: typeof shipCost === 'number' ? shipCost : 0,
                  status: 'pending',
                  payment_status: 'pending',
               },
               customerData: data 
            }),
         });
         const result = await response.json();
         if (!response.ok) {
            throw new Error(result.error || 'Failed to place order');
         }
         reset();
         router.push(`/order-success?orderId=${result.orderId}&orderNumber=${result.orderNumber}`);
      } catch (error) {
         console.error('Checkout error:', error);
         // Handle error, maybe show a notification
      } finally {
         setPlacingOrder(false);
      }
   });

   // Show loading state while customer data is loading
   if (loading || (isUserLoaded && isSignedIn && isCustomerLoading)) {
    return <div className="text-center pt-100 pb-100">Loading...</div>;
  }

   // Show sign-in prompt if not authenticated
   if (isUserLoaded && !isSignedIn) {
     return (
       <div className="text-center pt-100 pb-100">
         <h3>Please sign in to continue</h3>
         <p className="mb-4">You need to be signed in to complete your checkout.</p>
         <Link href="/sign-in" className="tp-btn-2">
           Sign In
         </Link>
       </div>
     );
   }
   
   return (
    <section className="checkout-area pb-50">
      <div className="container">
        {cartItems.length === 0 && !loading && (
          <div className='text-center pt-100'>
            <h3>Your cart is empty</h3>
            <Link href="/shop" className="tp-btn-2 mt-10">Return to shop</Link>
          </div>
        )}
        {cartItems.length > 0 && (
          <form onSubmit={onSubmit}>
            <div className="row">
              <div className="col-lg-6 col-md-12">
                 <div className="checkbox-form">
                    <h3>Billing Details</h3>
                    {hasProfile && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-700 mb-0">
                          ✓ Your profile information has been loaded. You can update it below if needed.
                        </p>
                      </div>
                    )}
                    {customerError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-700 mb-0">
                          ⚠️ {customerError}
                        </p>
                      </div>
                    )}
                    <div className="row">
                          <div className="col-md-12">
                             <div className="country-select">
                                <label>Country <span className="required">*</span></label>
                                <select id='country' {...register("country")}>
                                      <option value="">Select Country</option>
                                      <option value="united-states">United States</option>
                                      <option value="algeria">Algeria</option>
                                      <option value="canada">Canada</option>
                                      <option value="germany">Germany</option>
                                      <option value="england">England</option>
                                      <option value="qatar">Qatar</option>
                                      <option value="dominican-republic">Dominican Republic</option>
                                </select>
                                <ErrorMsg msg={errors.country?.message!} />
                             </div>
                          </div>
                          <div className="col-md-6">
                             <div className="checkout-form-list">
                                <label>First Name <span className="required">*</span></label>
                                <input id='firstName' {...register("firstName")} type="text" placeholder="First Name" />
                                <ErrorMsg msg={errors.firstName?.message!} />
                             </div>
                          </div>
                          <div className="col-md-6">
                             <div className="checkout-form-list">
                                <label>Last Name <span className="required">*</span></label>
                                <input id='lastName' {...register("lastName")} type="text" placeholder="Last Name" />
                                <ErrorMsg msg={errors.lastName?.message!} />
                             </div>
                          </div>
                          <div className="col-md-12">
                             <div className="checkout-form-list">
                                <label>Company Name</label>
                                <input id='company' {...register("company")} type="text" placeholder="Company" />
                                <ErrorMsg msg={errors.company?.message!} />
                             </div>
                          </div>
                          <div className="col-md-12">
                             <div className="checkout-form-list">
                                <label>Address <span className="required">*</span></label>
                                <input id='address' {...register("address")} type="text" placeholder="Street address" />
                                <ErrorMsg msg={errors.address?.message!} />
                             </div>
                          </div>
                          <div className="col-md-12">
                             <div className="checkout-form-list">
                                <input id='apartment' {...register("apartment")} type="text" placeholder="Apartment, suite, unit etc. (optional)" />
                             </div>
                          </div>
                          <div className="col-md-12">
                             <div className="checkout-form-list">
                                <label>Town / City <span className="required">*</span></label>
                                <input id='city' {...register("city")} type="text" placeholder="Town / City" />
                                <ErrorMsg msg={errors.city?.message!} />
                             </div>
                          </div>
                          <div className="col-md-6">
                             <div className="checkout-form-list">
                                <label>State / County <span className="required">*</span></label>
                                <input id='state' {...register("state")} type="text" placeholder="State" />
                                <ErrorMsg msg={errors.state?.message!} />
                             </div>
                          </div>
                          <div className="col-md-6">
                             <div className="checkout-form-list">
                                <label>Postcode / Zip <span className="required">*</span></label>
                                <input id='zipCode' {...register("zipCode")} type="text" placeholder="Postcode / Zip" />
                                <ErrorMsg msg={errors.zipCode?.message!} />
                             </div>
                          </div>
                          <div className="col-md-6">
                             <div className="checkout-form-list">
                                <label>Email Address <span className="required">*</span></label>
                                <input id='email' {...register("email")} type="email" placeholder="Email" />
                                <ErrorMsg msg={errors.email?.message!} />
                             </div>
                          </div>
                          <div className="col-md-6">
                             <div className="checkout-form-list">
                                <label>Phone <span className="required">*</span></label>
                                <input id='phone' {...register("phone")} type="text" placeholder="Phone" />
                                <ErrorMsg msg={errors.phone?.message!} />
                             </div>
                          </div>
                    </div>
                    <div className="different-address">
                          <div className="order-notes">
                             <div className="checkout-form-list">
                                <label>Order Notes</label>
                                <textarea id='orderNote' {...register("orderNote")} cols={30} rows={10}
                                      placeholder="Notes about your order, e.g. special notes for delivery.">
                                 </textarea>
                             </div>
                          </div>
                    </div>
                 </div>
              </div>
              <div className="col-lg-6 col-md-12">
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
                                {cartItems && cartItems.map((product) => (
                                      <tr className="cart_item" key={product._id}>
                                            <td className="product-name">
                                               {product.title} <strong className="product-quantity"> 
                                               × {product.orderQuantity}</strong>
                                            </td>
                                            <td className="product-total">
                                               <span className="amount">${(product.sale_price ?? product.price).toFixed(2)}</span>
                                            </td>
                                      </tr>
                                ))}
                             </tbody>
                             <tfoot>
                                <tr className="cart-subtotal">
                                      <th>Cart Subtotal</th>
                                      <td><span className="amount">${total.toFixed(2)}</span></td>
                                </tr>
                                <tr className="shipping">
                                      <th>Shipping</th>
                                      <td>
                                         <ul>
                                            <li>
                                                  <input onChange={()=> setShipCost(7.00)} checked={shipCost === 7.00} type="radio" id='shipping' name="shipping"/>
                                                  <label htmlFor='shipping'>
                                                     Flat Rate: <span className="amount">$7.00</span>
                                                  </label>
                                            </li>
                                            <li>
                                                  <input id='free-shipping' onChange={()=> setShipCost('free')} type="radio" name="shipping"/>
                                                  <label htmlFor='free-shipping'>Free Shipping:</label>
                                            </li>
                                         </ul>
                                      </td>
                                </tr>
                                <tr className="order-total">
                                      <th>Order Total</th>
                                      <td>
                                         <strong>
                                            <span className="amount">
                                               ${typeof shipCost === 'number' ? (total + shipCost).toFixed(2) : total.toFixed(2)}
                                            </span>
                                         </strong>
                                      </td>
                                </tr>
                             </tfoot>
                          </table>
                    </div>
                    <div className="payment-method">
                       <div className="order-button-payment mt-20">
                         <button type="submit" className="tp-btn tp-color-btn w-100 banner-animation" disabled={placingOrder}>
                           {placingOrder ? 'Placing Order...' : 'Place order'}
                         </button>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default CheckoutArea;