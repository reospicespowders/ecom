'use client';
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Rating } from "react-simple-star-rating";
import { IProductData } from "@/types/product-d-t";
import { averageRating, discountPercentage } from "@/utils/utils";

// prop type
type IProps = {
  product: IProductData;
};

const ProductSmSingle = ({ product }: IProps) => {
  let discount = 0;
  if (product.sale_price) {
    discount = discountPercentage(product.price, product.sale_price);
  }
  return (
    <div className="tpbrandproduct__card card-modern p-relative mb-20">
      <div className="tpbrandproduct__img-wrap p-relative">
        <Image 
          src={product.image} 
          alt="product-img" 
          width={160} 
          height={160} 
          className="tpbrandproduct__img-modern"
          style={{ objectFit: 'cover', borderRadius: '12px', width: '100%', height: '160px', background: '#f8f8f8' }}
        />
        {discount > 0 && (
          <span className="tpproduct__info-discount-modern bage__discount">-{discount.toFixed(0)}% Off</span>
        )}
      </div>
      <div className="tpbrandproduct__content-modern">
        <div className="tpbrandproduct__category-modern">
          {product.category?.name || 'Uncategorized'}
        </div>
        <h4 className="tpbrandproduct__title-modern">
          <Link href={`/shop/${product.category?.slug?.current || 'uncategorized'}/${product.slug}`}>{product.title}</Link>
        </h4>
        <div className="tpbrandproduct__rating-modern mb-5">
          <Rating allowFraction size={14} initialValue={averageRating(product.reviews)} readonly={true} />
        </div>
        <div className="tpbrandproduct__price-modern">
          <span>${product.sale_price ? product.sale_price.toFixed(2) : product.price.toFixed(2)}</span>
          {product.sale_price && <del>${product.price.toFixed(2)}</del>}
        </div>
      </div>
    </div>
  );
};

export default ProductSmSingle;
