"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Rating } from "react-simple-star-rating";
import { IProductData } from "@/types/product-d-t";
import { averageRating, discountPercentage, isHot } from "@/utils/utils";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { add_cart_product } from "@/redux/features/cart";
import { add_to_wishlist } from "@/redux/features/wishlist";
import { add_to_compare } from "@/redux/features/compare";
import { handleModalProduct, handleOpenModal } from "@/redux/features/utility";

// prop type
type IProps = {
  product: IProductData;
};

const ProductListItem = ({ product }: IProps) => {
  const {image,price,sale_price,title,updated_at,quantity,sold,category,reviews,productInfoList} = product || {};
  let discount = 0;
  if (sale_price) {
    discount = discountPercentage(price, sale_price);
  }
  const [isItemAddToCart, setIsItemAddToCart] = useState(false);
  const [isCompareAdd, setIsCompareAdd] = useState(false);
  const [isWishlistAdd, setIsWishlistAdd] = useState(false);
  const { cart_products } = useAppSelector((state) => state.cart);
  const { wishlist } = useAppSelector((state) => state.wishlist);
  const { compare_products } = useAppSelector((state) => state.compare);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsItemAddToCart(cart_products.some((i) => i.id === product.id));
    setIsWishlistAdd(wishlist.some((i) => i.id === product.id));
    setIsCompareAdd(compare_products.some((i) => i.id === product.id));
  }, [cart_products, compare_products, product.id, wishlist]);

  const handleQuickView = () => {
    dispatch(handleModalProduct({ product }));
    dispatch(handleOpenModal());
  };

  return (
    <div className="tplist__product d-flex align-items-center justify-content-between mb-20">
      <div className="tplist__product-img p-relative">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={image}
            alt={title}
            width={222}
            height={221}
            style={{ width: '100%', height: 'auto' }}
          />
        </Link>
        <div className="tpproduct__info bage">
          {discount > 0 && (
            <span className="tpproduct__info-discount bage__discount">
              {discount.toFixed(0)}% Off
            </span>
          )}
          {isHot(updated_at) && (
            <span className="tpproduct__info-hot bage__hot">HOT</span>
          )}
        </div>
        <div className="tplist__shopping-list">
          <button
            className="tplist__shopping-btn-list"
            onClick={handleQuickView}
          >
            <i className="icon-eye"></i>
          </button>
          <button
            className={`tplist__shopping-btn-list ${isWishlistAdd ? 'active' : ''}`}
            onClick={() => dispatch(add_to_wishlist(product))}
          >
            <i className="icon-heart"></i>
          </button>
          <button
            className={`tplist__shopping-btn-list ${isCompareAdd ? 'active' : ''}`}
            onClick={() => dispatch(add_to_compare(product))}
          >
            <i className="icon-layers"></i>
          </button>
        </div>
      </div>
      <div className="tplist__content">
        <span className="tplist__content-weight">{category.name}</span>
        <h4 className="tplist__content-title">
          <Link href={`/product/${product.slug}`}>{title}</Link>
        </h4>
        <div className="tplist__rating mb-5">
          <Rating allowFraction size={16} initialValue={averageRating(reviews)} readonly={true} />
        </div>
        {productInfoList && productInfoList.length > 0 && (
          <ul className="tplist__content-info">
            {productInfoList.map((info, i) => (
              <li key={i}>{typeof info === 'string' ? info : info.title}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="tplist__price justify-content-end">
        <h4 className="tplist__instock">
          Availability: <span>{quantity} in stock</span>
        </h4>
        <h3 className="tplist__count mb-15">
          ${sale_price ? sale_price.toFixed(2) : price.toFixed(2)}
          {sale_price && <del>${price.toFixed(2)}</del>}
        </h3>
        {isItemAddToCart ? (
          <Link href="/cart" className="tp-btn-2 mb-10">
            View Cart
          </Link>
        ) : (
          <button className="tp-btn-2 mb-10"
            onClick={() => dispatch(add_cart_product(product))}
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductListItem;
