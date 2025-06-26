'use client';

import Link from 'next/link';
import Image from 'next/image';
import { IProductData } from '@/types/product-d-t';
import { useSession } from '@clerk/nextjs';
import { handleAddToCart, handleToggleWishlist } from '@/utils/cart';
import { useState, useEffect } from 'react';

const ProductCard = ({ product, style }: { product: IProductData, style: string }) => {
  const { session } = useSession();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    async function checkWishlist() {
        if (!session) return;
        const token = await session.getToken();
        if (!token) return;

        const response = await fetch('/api/wishlist', {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
            const wishlist = await response.json();
            setIsWishlisted(wishlist.some((item: any) => item.product_id === product._id));
        }
    }
    checkWishlist();

    const handleWishlistUpdate = () => checkWishlist();
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [product._id, session]);

  const handleWishlistToggle = async () => {
      const success = await handleToggleWishlist(product._id, () => session?.getToken() || Promise.resolve(null), isWishlisted);
      if (success) {
          setIsWishlisted(!isWishlisted);
      }
  };

  return (
    <div className={`product__item ${style} w-100`}>
      <div className="product__thumb fix">
        <div className="product-image w-img">
          <Link href={`/shop/${product.slug}`}>
            <Image
              src={product.image}
              alt={product.title}
              width={300}
              height={300}
            />
          </Link>
        </div>
        <div className="product-action">
          <a href="#" className="icon-box icon-box-1" data-bs-toggle="modal" data-bs-target="#productModalId">
            <i className="fal fa-eye"></i>
            <i className="fal fa-eye"></i>
          </a>
          <a href="#" className="icon-box icon-box-1" onClick={handleWishlistToggle}>
            <i className={`fal fa-heart ${isWishlisted ? 'active' : ''}`}></i>
            <i className={`fal fa-heart ${isWishlisted ? 'active' : ''}`}></i>
          </a>
          <a href="#" className="icon-box icon-box-1">
            <i className="fal fa-layer-group"></i>
            <i className="fal fa-layer-group"></i>
          </a>
        </div>
      </div>
      <div className="product__content">
        <h6><Link href={`/shop/${product.slug}`}>{product.title}</Link></h6>
        <div className="rating mb-5">
          <ul>
            <li><a href="#"><i className="fal fa-star"></i></a></li>
            <li><a href="#"><i className="fal fa-star"></i></a></li>
            <li><a href="#"><i className="fal fa-star"></i></a></li>
            <li><a href="#"><i className="fal fa-star"></i></a></li>
            <li><a href="#"><i className="fal fa-star"></i></a></li>
          </ul>
          <span>(01 review)</span>
        </div>
        <div className="price">
          <span>${product.price}</span>
          {product.sale_price && <span className="old-price">${product.sale_price}</span>}
        </div>
      </div>
      <div className="product__add-cart text-center">
        <button type="button" onClick={() => handleAddToCart(product._id, 1, () => session?.getToken() ?? Promise.resolve(null))}
          className="cart-btn product-modal-sidebar-open-btn d-flex align-items-center justify-content-center w-100">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 