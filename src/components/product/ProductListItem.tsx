'use client';

import Link from 'next/link';
import Image from 'next/image';
import { IProduct } from '@/lib/sanity.fetch';
import { useSession } from '@clerk/nextjs';
import { handleAddToCart } from '@/utils/cart';

const ProductListItem = ({ product }: { product: IProduct }) => {
  const { session } = useSession();
  return (
    <div className="product__item-2 product__item-3 d-sm-flex align-items-center mb-40">
      <div className="product__thumb-2 mr-25">
        <div className="product-image w-img">
          <Link href={`/shop/${product.slug.current}`}>
            <Image
              src={product.images[0].asset.url}
              alt={product.name}
              width={200}
              height={200}
            />
          </Link>
        </div>
      </div>
      <div className="product__content-2">
        <div className="product__content-top">
          <div className="product-category-2">
            <span>{product.category.name}</span>
          </div>
          <div className="rating-2">
            <ul>
              <li><a href="#"><i className="fas fa-star"></i></a></li>
              <li><a href="#"><i className="fas fa-star"></i></a></li>
              <li><a href="#"><i className="fas fa-star"></i></a></li>
              <li><a href="#"><i className="fas fa-star"></i></a></li>
              <li><a href="#"><i className="fal fa-star"></i></a></li>
            </ul>
            <span>(01 review)</span>
          </div>
        </div>
        <h6 className="product-name"><Link href={`/shop/${product.slug.current}`}>{product.name}</Link></h6>
        <div className="price-2">
          <span>${product.price}</span>
          {product.sale_price && <span className="old-price">${product.sale_price}</span>}
        </div>
        <div className="product-desc-2">
          <p>{product.description}</p>
        </div>
        <div className="product-action-2">
          <button onClick={() => handleAddToCart(product._id, 1, () => session?.getToken() ?? Promise.resolve(null))} className="cart-btn-2" type="button"><i className="fas fa-shopping-cart"></i> Add to Cart</button>
          <a href="#" className="action-btn-2"><i className="fas fa-heart"></i></a>
          <a href="#" className="action-btn-2"><i className="fas fa-layer-group"></i></a>
        </div>
      </div>
    </div>
  );
};

export default ProductListItem; 