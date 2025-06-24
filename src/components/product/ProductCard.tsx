'use client';

import Link from 'next/link';
import Image from 'next/image';
import { IProduct } from '@/lib/sanity.fetch';
import { useSession } from '@clerk/nextjs';
import { handleAddToCart } from '@/utils/cart';

const ProductCard = ({ product, style }: { product: IProduct, style: string }) => {
  const { session } = useSession();
  return (
    <div className={`product__item ${style} w-100`}>
      <div className="product__thumb fix">
        <div className="product-image w-img">
          <Link href={`/shop/${product.slug.current}`}>
            <Image
              src={product.images[0].asset.url}
              alt={product.name}
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
          <a href="#" className="icon-box icon-box-1">
            <i className="fal fa-heart"></i>
            <i className="fal fa-heart"></i>
          </a>
          <a href="#" className="icon-box icon-box-1">
            <i className="fal fa-layer-group"></i>
            <i className="fal fa-layer-group"></i>
          </a>
        </div>
      </div>
      <div className="product__content">
        <h6><Link href={`/shop/${product.slug.current}`}>{product.name}</Link></h6>
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