"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { IProductData } from "@/types/product-d-t";
import Image from "next/image";
import { useSession } from "@clerk/nextjs";
import { handleAddToCart, handleToggleWishlist } from "@/utils/cart";
import { toast } from "react-toastify";
import empty_wishlist_img from "@/assets/img/cart/empty-cart.png";

const WishlistArea = () => {
  const [wishlistItems, setWishlistItems] = useState<IProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useSession();

  const fetchWishlistDetails = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const token = await session.getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch wishlist items' }));
        throw new Error(errorData.error || 'Failed to fetch wishlist items');
      }
      let data = await response.json();
      data = data.filter(Boolean);

      setWishlistItems(data);
    } catch (error: any) {
      console.error(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchWishlistDetails();
    window.addEventListener('wishlistUpdated', fetchWishlistDetails);
    return () => window.removeEventListener('wishlistUpdated', fetchWishlistDetails);
  }, [session, fetchWishlistDetails]);

  const handleRemove = async (productId: string) => {
    const success = await handleToggleWishlist(productId, () => session?.getToken() || Promise.resolve(null), true);
    if (success) {
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
    }
  };

  const handleAddToCartAndRemove = async (product: IProductData) => {
    await handleAddToCart(product._id, 1, () => session?.getToken() || Promise.resolve(null));
    await handleRemove(product._id);
  }

  if (loading) {
    return <div className="text-center pt-100 pb-100">Loading wishlist...</div>;
  }

  return (
    <section className="cart-area pt-100 pb-100">
      <div className="container">
        <div className="row">
          <div className="col-12">
            {wishlistItems.length === 0 ? (
              <div className="text-center">
                <Image src={empty_wishlist_img} alt="empty wishlist" width={150} height={150} />
                <h3>Your Wishlist is Empty</h3>
                <p>Add items to your wishlist to see them here.</p>
                <Link href="/shop" className="tp-btn-2 mt-10">
                  Return to Shop
                </Link>
              </div>
            ) : (
              <div className="table-content table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="product-thumbnail">Images</th>
                      <th className="cart-product-name">Product</th>
                      <th className="product-price">Unit Price</th>
                      <th className="product-quantity">Stock Status</th>
                      <th className="product-subtotal">Add to Cart</th>
                      <th className="product-remove">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wishlistItems.map((item) => (
                      <tr key={item._id}>
                        <td className="product-thumbnail">
                          <Link href={`/shop/${item.category?.slug?.current || 'uncategorized'}/${item.slug}`}>
                            <Image src={item.image} alt={item.title} width={100} height={100} />
                          </Link>
                        </td>
                        <td className="product-name">
                          <Link href={`/shop/${item.category?.slug?.current || 'uncategorized'}/${item.slug}`}>
                            {item.title}
                          </Link>
                        </td>
                        <td className="product-price">
                          <span className="amount">${item.sale_price?.toFixed(2) || item.price.toFixed(2)}</span>
                        </td>
                        <td className="product-quantity">
                          <span className={item.quantity > 0 ? "text-success" : "text-danger"}>
                            {item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="product-subtotal">
                          <button 
                            className="tp-btn-2" 
                            onClick={() => handleAddToCartAndRemove(item)}
                            disabled={item.quantity === 0}
                          >
                            Add to Cart
                          </button>
                        </td>
                        <td className="product-remove">
                          <button onClick={() => handleRemove(item._id)} className="btn btn-danger btn-sm">
                            <i className="fa fa-times"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WishlistArea;
