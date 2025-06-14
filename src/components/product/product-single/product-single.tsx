"use client";
import React,{ useState , useEffect} from "react";
import Link from "next/link";
import Image from "next/image";
import { Rating } from "react-simple-star-rating";
import { IProductData } from "@/types/product-d-t";
import { averageRating, discountPercentage, isHot } from "@/utils/utils";
import CountdownTimer from "@/components/common/countdown-timer";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { handleModalProduct, handleOpenModal } from "@/redux/features/utility";
import { add_cart_product } from "@/redux/features/cart";
import { add_to_compare } from "@/redux/features/compare";
import { add_to_wishlist } from "@/redux/features/wishlist";
import { PortableText } from '@portabletext/react'; // Ensure this import is present if not already there

// prop type
type IProps = {
  product: IProductData;
  progress?: boolean;
  offer_style?: boolean;
  cls?: string;
  price_space?: string;
};

const ProductSingle = ({product,progress,cls,offer_style,price_space}:IProps) => {
  const {image,price,sale_price,title,updated_at,quantity,sold,category,offerDate,reviews,description,additionalInfo} = product || {};

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

  // State for active tab in product details
  const [activeTab, setActiveTab] = useState('description');
  // State for main image in gallery
  const [mainImage, setMainImage] = useState(product.image);
  // State for quantity
  const [quantityCount, setQuantityCount] = useState(product.orderQuantity || 1); // Declaring quantity state

  useEffect(() => {
    setIsItemAddToCart(cart_products.some((i) => i.id === product.id));
    setIsWishlistAdd(wishlist.some((i) => i.id === product.id));
    setIsCompareAdd(compare_products.some((i) => i.id === product.id));
  }, [cart_products, compare_products, product.id, wishlist]);

  const handleProductModal = (prd: IProductData) => {
    dispatch(handleModalProduct({ product: prd }))
    dispatch(handleOpenModal())
  }

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= product.quantity) {
      setQuantityCount(value); // Using setQuantityCount here
    }
  };

  const handleAddToCart = () => {
    dispatch(add_cart_product({ ...product, orderQuantity: quantityCount })); // Using quantityCount here
  };

  return (
    <div
      className={`tpproduct p-relative ${cls ? cls : ""} ${progress ? "tpprogress__hover" : ""}`}
    >
      <div className="tpproduct__thumb p-relative text-center">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={image}
            alt="product-img"
            width={217}
            height={217}
            style={{ width: "100%", height: "auto" }}
          />
        </Link>
        {image && (
          <Link href={`/product/${product.slug}`} className="tpproduct__thumb-img">
            <Image
              src={image}
              alt="product-img"
              width={217}
              height={217}
              style={{ width: "100%", height: "auto" }}
            />
          </Link>
        )}
        <div className="tpproduct__info bage">
          {discount > 0 && (
            <span className="tpproduct__info-discount bage__discount">
              -{discount.toFixed(0)}%
            </span>
          )}
          {isHot(updated_at) && (
            <span className="tpproduct__info-hot bage__hot">HOT</span>
          )}
        </div>
        <div className="tpproduct__shopping">
          <a className="tpproduct__shopping-wishlist pointer"
           onClick={() => dispatch(add_to_wishlist(product))}>
            <i className={"icon-heart icons" + (isWishlistAdd ? " active" : "")}></i>
          </a>
          <a className="tpproduct__shopping-wishlist pointer"
           onClick={() => dispatch(add_to_compare(product))}>
            <i className={"icon-layers" + (isCompareAdd ? " active" : "")}></i>
          </a>
          <a className="tpproduct__shopping-cart pointer" onClick={() =>handleProductModal(product)}>
            <i className="icon-eye"></i>
          </a>
        </div>
      </div>
      <div className="tpproduct__content">
        <span
          className={`tpproduct__content-weight ${offer_style ? "mb-10" : ""}`}
        >
          {/* Safely access category name and slug for the link */}
          <Link href={`/shop?category=${category?.slug?.current || ''}`}>
            {category?.name || 'Uncategorized'}
          </Link>
        </span>
        <h4 className="tpproduct__title">
          <Link href={`/product/${product.slug}`}>{title}</Link>
        </h4>
        <div className="tpproduct__rating mb-5">
          <Rating allowFraction size={16} initialValue={averageRating(reviews)} readonly={true} />
        </div>
        <div
          className={`tpproduct__price ${offer_style ? "tpproduct__big-price" : ""} ${price_space}`}
        >
          <span>${sale_price ? sale_price.toFixed(2) : price.toFixed(2)} </span>
          {sale_price && <del>${price.toFixed(2)}</del>}
        </div>
        {offer_style && (
          <>
            <div className="deals-label">Harry Up! Offer end in:</div>
            <CountdownTimer
              expiryTimestamp={new Date((offerDate as any)?.end!)}
              cls="tpcoundown__themebg"
            />
          </>
        )}
        {progress && (
          <div className="tpproduct__progress">
            <div className="progress mb-5">
              <div
                className="progress-bar"
                style={{ width: `${(sold / quantity) * 100}%` }}
              ></div>
            </div>
            <span>
              Sold: <b>{sold}/{quantity}</b>
            </span>
          </div>
        )}
      </div>
      <div className="tpproduct__hover-text">
        <div className="tpproduct__hover-btn d-flex justify-content-center mb-10">
           {isItemAddToCart ? (
            <Link href="/cart" className="tp-btn-2 pointer">
              View Cart
            </Link>
          ) : (
            <a
              onClick={() => dispatch(add_cart_product({ ...product, orderQuantity: quantityCount }))}
              className="tp-btn-2 pointer"
            >
              Add to Cart
            </a>
          )}
        </div>
        <div className="tpproduct__descrip">
          <ul>
            <li>Category: {category?.name || 'N/A'}</li>
            <li>MFG: {updated_at ? new Date(updated_at).toLocaleDateString() : 'N/A'}</li>
            <li>LIFE: 60 days</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductSingle;