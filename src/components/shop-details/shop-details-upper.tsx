"use client";
import React from "react";
import ShopDetailsBox from "./shop-details-box";
import { IProductData } from "@/types/product-d-t";
import { Rating } from "react-simple-star-rating";
import { averageRating } from "@/utils/utils";

// prop type
type IProps = {
  product: IProductData;
  navStyle?: boolean;
  topThumb?: boolean;
};
const ShopDetailsUpper = ({ product, navStyle, topThumb }: IProps) => {
  
  return (
    <div className="tpdetails__product mb-30">
      <div className="tpdetails__title-box">
        <h3 className="tpdetails__title">{product.title}</h3>
        <ul className="tpdetails__brand">
          <li>
            Brands: <a href="#">{product.brand}</a>
          </li>
          <li>
            <Rating
              allowFraction
              size={16}
              initialValue={averageRating(product.reviews)}
              readonly={true}
            />
            <b>{product.reviews?.length || 0} Reviews</b>
          </li>
          <li>
            SKU: <span>{product.sku}</span>
          </li>
        </ul>
      </div>
      {/* shop details box start */}
      <ShopDetailsBox
        product={product}
        navStyle={navStyle}
        topThumb={topThumb}
      />
      {/* shop details box end */}
    </div>
  );
};

export default ShopDetailsUpper;
