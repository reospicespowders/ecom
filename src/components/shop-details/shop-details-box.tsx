'use client';
import React from "react";
import Image from "next/image";
import { IProductData } from "@/types/product-d-t";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { add_cart_product, decrement, increment } from "@/redux/features/cart";
import { discountPercentage } from "@/utils/utils";

// prop type
type IProps = {
  product: IProductData;
  navStyle?: boolean;
  topThumb?: boolean;
};

const ShopDetailsBox = ({ product, navStyle, topThumb }: IProps) => {
  const {gallery,image,price,productInfoList,quantity,color,tags,category} = product;
  const [activeImg, setActiveImg] = React.useState(image);
  const { orderQuantity } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();

  let discount = 0;
  if (product.sale_price) {
    discount = discountPercentage(product.price, product.sale_price);
  }

  // handle active image
  const handleActiveImg = (img: string) => {
    setActiveImg(img);
  };
  return (
    <>
      <div className="tpdetails__box">
        <div className="row">
          <div className="col-lg-6">
            {!navStyle && (
              <div className="tpproduct-details__nab p-relative">
                {gallery ? (
                  gallery.map((item, index) => (
                    <div className="tpproduct-details__thumb" key={index}>
                      <Image src={item} alt="image" width={500} height={500} />
                    </div>
                  ))
                ) : (
                  <div className="tpproduct-details__thumb-img mb-10">
                    <Image
                      src={image}
                      alt="image"
                      width={500}
                      height={500}
                    />
                  </div>
                )}
              </div>
            )}
            {navStyle && (
              <div className="tpproduct-details__nab p-relative">
                {!topThumb && (
                  <div className="w-img">
                    <Image
                      src={activeImg}
                      alt="prd-image"
                      width={500}
                      height={500}
                      style={{ height: "auto" }}
                    />
                    <div className="tpproduct__info bage">
                      <span className="tpproduct__info-hot bage__hot">HOT</span>
                    </div>
                  </div>
                )}

                <nav>
                  <div className="nav nav-tabs justify-content-center">
                    {gallery &&
                      gallery.map((img, index) => (
                        <button
                          className={`nav-link ${
                            img === activeImg ? "active" : ""
                          }`}
                          key={index}
                          onClick={() => handleActiveImg(img)}
                        >
                          <Image
                            src={img}
                            alt="nav-img"
                            width={60}
                            height={60}
                          />
                        </button>
                      ))}
                  </div>
                </nav>

                {topThumb && (
                  <div className="w-img">
                    <Image
                      src={activeImg}
                      alt="prd-image"
                      width={500}
                      height={500}
                      style={{ height: "auto" }}
                    />
                    <div className="tpproduct__info bage">
                      <span className="tpproduct__info-hot bage__hot">HOT</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="col-lg-6">
            <div className="product__details product__sticky">
              <div className="product__details-price-box">
                <h5 className="product__details-price">
                  ${product.sale_price ? product.sale_price.toFixed(2) : product.price.toFixed(2)}
                  {product.sale_price && (
                    <del>${product.price.toFixed(2)}</del>
                  )}
                  {discount > 0 && (
                    <span className="discount-tag">-{discount.toFixed(0)}% Off</span>
                  )}
                </h5>
                {productInfoList && productInfoList.length > 0 && (
                  <ul className="product__details-info-list">
                    {productInfoList.map((item, index) => (
                      <li key={index}>{item.title}: {item.value}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="product__color-switch mb-25">
                <h4 className="product__color-title">Color: Select a color</h4>
                <div className="tpshop__widget-color-box d-flex align-items-center">
                  {Array.isArray(color) && color.length > 0 &&
                    color.map((clr, i) => (
                      <span
                        key={i}
                        className="color-swatch"
                        style={{ backgroundColor: clr }}
                      ></span>
                    ))}
                </div>
              </div>
              <div className="product__details-cart">
                <div className="product__details-quantity d-flex align-items-center mb-15">
                  <b>Qty:</b>
                  <div className="product__details-count mr-10">
                    <span className="cart-minus" onClick={() => dispatch(decrement())}>
                      <i className="far fa-minus"></i>
                    </span>
                    <input
                      className="tp-cart-input"
                      type="text"
                      value={orderQuantity}
                      readOnly
                    />
                    <span className="cart-plus" onClick={() => dispatch(increment())}>
                      <i className="far fa-plus"></i>
                    </span>
                  </div>
                  <div className="product__details-btn" onClick={() => dispatch(add_cart_product(product))}>
                    <a className="pointer">add to cart</a>
                  </div>
                </div>
                <ul className="product__details-check">
                  <li>
                    <a href="#">
                      <i className="icon-heart icons"></i> add to wishlist
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="icon-layers"></i> Add to Compare
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="icon-share-2"></i> Share
                    </a>
                  </li>
                </ul>
              </div>
              <div className="product__details-stock mb-25">
                <ul>
                  <li>
                    Availability: <i>{quantity} In stock</i>
                  </li>
                  <li>
                    Categories: <span>{category.name}</span>
                  </li>
                  <li>
                    Tags: <span>{tags.join(", ")}</span>
                  </li>
                </ul>
              </div>
              <div className="product__details-payment text-center">
                <Image
                  src="/assets/img/shape/payment-2.png"
                  alt="payment"
                  width={289}
                  height={26}
                  style={{ height: "auto" }}
                />
                <span>Guarantee safe & Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopDetailsBox;
