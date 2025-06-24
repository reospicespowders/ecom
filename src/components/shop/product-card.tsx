'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IProductData } from "@/types/product-d-t";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { add_to_wishlist } from "@/redux/features/wishlist";
import { add_to_compare } from "@/redux/features/compare";
import { handleModalProduct, handleOpenModal } from "@/redux/features/utility";
import { discountPercentage, isHot } from "@/utils/utils";
import { Rating } from "react-simple-star-rating";
import { averageRating } from "@/utils/utils";

// prop type
type IProps = {
  product: IProductData;
};

const ProductCard = ({ product }: IProps) => {
  const {image,price,sale_price,title,updated_at,quantity,sold,category,unit,reviews,productInfoList} = product || {};
  let discount = 0;
  if (sale_price) {
    discount = discountPercentage(price, sale_price);
  }
  const [isCompareAdd, setIsCompareAdd] = useState(false);
  const [isWishlistAdd, setIsWishlistAdd] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const { wishlist } = useAppSelector((state) => state.wishlist);
  const { compare_products } = useAppSelector((state) => state.compare);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsWishlistAdd(wishlist.some((i) => i.id === product.id));
    setIsCompareAdd(compare_products.some((i) => i.id === product.id));
  }, [compare_products, product.id, wishlist]);

  const handleProductModal = (prd: IProductData) => {
    dispatch(handleModalProduct({ product: prd }))
    dispatch(handleOpenModal())
  }

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product._id,
          quantity: 1, 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }
      console.log('Item added to cart successfully');
    } catch (error) {
      console.error(error);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="tpproduct">
      <div className="tpproduct__thumb p-relative text-center">
        <Link href={`/shop/${product.category?.slug?.current || 'uncategorized'}/${product.slug}`}>
          <Image
            src={image}
            alt="product-img"
            width={217}
            height={217}
            style={{ width: "100%", height: "auto" }}
          />
        </Link>
        <div className="tpproduct__info bage">
          {isHot(updated_at) && (
            <span className="tpproduct__info-hot bage__hot">HOT</span>
          )}
          {sale_price && (
            <span className="tpproduct__info-sale bage__sale">
              {discount}%
            </span>
          )}
        </div>
        <div className="tpproduct__shopping">
          <button
            className="tpproduct__shopping-btn"
            onClick={() => handleProductModal(product)}
          >
            <i className="icon-eye"></i>
          </button>
          <button
            className="tpproduct__shopping-btn"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            <i className="icon-shopping-cart"></i>
          </button>
          <button
            className={`tpproduct__shopping-btn ${isWishlistAdd ? 'active' : ''}`}
            onClick={() => dispatch(add_to_wishlist(product))}
          >
            <i className="icon-heart"></i>
          </button>
          <button
            className={`tpproduct__shopping-btn ${isCompareAdd ? 'active' : ''}`}
            onClick={() => dispatch(add_to_compare(product))}
          >
            <i className="icon-layers"></i>
          </button>
        </div>
      </div>
      <div className="tpproduct__content">
        <span className="tpproduct__content-weight">
          {category.name}
        </span>
        <h4 className="tpproduct__title">
          <Link href={`/shop/${product.category?.slug?.current || 'uncategorized'}/${product.slug}`}>{title}</Link>
        </h4>
        <div className="tpproduct__price">
          <span>${price.toFixed(2)}</span>
          {sale_price && (
            <del>${sale_price.toFixed(2)}</del>
          )}
        </div>
        {reviews && reviews.length > 0 && (
          <div className="tpproduct__rating">
            <Rating
              allowFraction
              size={16}
              initialValue={averageRating(reviews)}
              readonly={true}
            />
            <span className="tpproduct__rating-text">
              ({reviews.length} Reviews)
            </span>
          </div>
        )}
      </div>
      <div className="tpproduct__hover-text">
        <div className="tpproduct__descrip">
          {productInfoList && productInfoList.length > 0 && (
            <ul>
              {productInfoList.map((info, index) => (
                <li key={index}>{typeof info === 'string' ? info : info.title}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 