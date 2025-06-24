'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IProductData } from "@/types/product-d-t";
import { useAppDispatch } from "@/redux/hook";
import { add_to_wishlist } from "@/redux/features/wishlist";
import { add_to_compare } from "@/redux/features/compare";
import { handleAddToCart as sharedHandleAddToCart } from '@/utils/cart';
import { Rating } from "react-simple-star-rating";
import { averageRating, discountPercentage } from "@/utils/utils"; // Added discountPercentage
import { PortableText } from '@portabletext/react';
import Link from "next/link";
import { getProductsByCategory } from "@/lib/sanity.fetch";
import ProductSmSingle from "@/components/product/product-single/product-sm-single";

interface Props {
  product: IProductData;
}

const ProductDetails = ({ product }: Props) => {
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [mainImage, setMainImage] = useState(product.image);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<IProductData[]>([]);
  const dispatch = useAppDispatch();

  // Helper for blur placeholder (optional: you can generate a static blurDataURL or use a tiny image)
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWUiLz48L3N2Zz4=";

  useEffect(() => {
    const fetchRelated = async () => {
      if (product.category?.slug?.current) {
        const fetchedProducts = await getProductsByCategory(product.category.slug.current);
        // Filter out the current product from related products
        setRelatedProducts(fetchedProducts.filter((p: IProductData) => p._id !== product._id));
      }
    };
    fetchRelated();
  }, [product.category?.slug, product._id]);

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= product.quantity) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    console.log('Add to Cart button clicked', product._id, quantity);
    setAddingToCart(true);
    await sharedHandleAddToCart(product._id, quantity, () => Promise.resolve(null));
    setAddingToCart(false);
  };

  // Calculate discount
  let discount = 0;
  if (product.sale_price) {
    discount = discountPercentage(product.price, product.sale_price);
  }

  return (
    <div className="tpproduct__details-wrapper">
      <div className="row">
        <div className="col-lg-6">
          <div className="tpproduct__details-thumb-wrapper">
            <div
              className="tpproduct__details-main-img mb-30"
              style={{ position: 'relative', overflow: 'hidden', width: '100%', paddingTop: '100%' /* 1:1 Aspect Ratio, adjust as needed */ }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                {imgError ? (
                  <div className="img-fallback" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#f3f3f3' }}>
                    Image not available
                  </div>
                ) : (
                  <Image
                    src={mainImage}
                    alt={product.title}
                    fill
                    style={{ objectFit: 'contain', transition: 'transform 0.3s', cursor: 'zoom-in' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                    onLoadingComplete={() => setImgLoading(false)}
                    onError={() => setImgError(true)}
                    onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                    onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                )}
                {imgLoading && !imgError && (
                  <div className="img-skeleton-loader" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                    <span className="loader"></span>
                  </div>
                )}
              </div>
            </div>
            {product.gallery && product.gallery.length > 0 && (
              <div className="tpproduct__details-thumb-nav" style={{ display: 'flex', gap: 8 }}>
                {[product.image, ...product.gallery].map((imgUrl, index) => (
                  <button
                    key={index}
                    className={`tpproduct__details-thumb-nav-item${mainImage === imgUrl ? ' active' : ''}`}
                    style={{
                      border: mainImage === imgUrl ? '2px solid #0070f3' : '1px solid #eee',
                      padding: 2,
                      borderRadius: 6,
                      background: '#fff',
                      cursor: 'pointer',
                      outline: 'none',
                      width: 60,
                      height: 60,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    aria-label={`Show image ${index + 1}`}
                    onClick={() => {
                      setMainImage(imgUrl);
                      setImgLoading(true);
                      setImgError(false);
                    }}
                  >
                    <Image
                      src={imgUrl}
                      alt={`thumbnail-${index}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="60px"
                      placeholder="blur"
                      blurDataURL={blurDataURL}
                      onError={e => (e.currentTarget.style.opacity = '0.3')}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="tpproduct__details-content">
            <h2 className="tpproduct__details-title">{product.title}</h2>
            <div className="tpproduct__details-meta mb-20">
              <span>Brand: <Link href="#">SpiceMaster</Link></span>
              <span> | </span>
              <div className="tpproduct__details-rating d-inline-block">
                <Rating allowFraction size={16} initialValue={averageRating(product.reviews)} readonly={true} />
                <span className="tpproduct__details-rating-text"> ({product.reviews?.length || 0} REVIEWS)</span>
              </div>
              <span> | </span>
              <span>SKU: {product.sku}</span>
            </div>

            <div className="tpproduct__details-price-area mb-20">
              <span className="price">${product.sale_price ? product.sale_price.toFixed(2) : product.price.toFixed(2)}</span>
              {product.sale_price && (
                <del className="old-price">${product.price.toFixed(2)}</del>
              )}
              {discount > 0 && (
                <span className="discount-tag">-{discount.toFixed(0)}% Off</span>
              )}
            </div>

            <div className="tpproduct__details-features mb-20">
              <ul>
                {product.productInfoList && product.productInfoList.map((info, i) => (
                  <li key={i}>{info.title}: {info.value}</li>
                ))}
              </ul>
            </div>

            {Array.isArray(product.color) && product.color.length > 0 && (
              <div className="tpproduct__details-color mb-20">
                <span className="color-label">COLOR: SELECT A COLOR</span>
                <div className="color-options">
                  {product.color.map((color, index) => (
                    <span key={index} className="color-box" style={{ backgroundColor: color }}></span>
                  ))}
                </div>
              </div>
            )}

            <div className="tpproduct__details-quantity-action mb-20">
              <div className="tpproduct__details-quantity d-inline-block me-3">
                <div className="tp-quantity">
                  <button
                    className="tp-quantity-btn"
                    onClick={() => handleQuantityChange(quantity - 1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                    min="1"
                    max={product.quantity}
                  />
                  <button
                    className="tp-quantity-btn"
                    onClick={() => handleQuantityChange(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                className="tp-btn-2 mr-10"
                onClick={handleAddToCart}
                disabled={product.quantity === 0 || addingToCart}
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <a className="tp-btn-wishlist pointer" onClick={() => dispatch(add_to_wishlist(product))}>
                <i className="icon-heart"></i>
              </a>
              <a className="tp-btn-compare pointer" onClick={() => dispatch(add_to_compare(product))}>
                <i className="icon-layers"></i>
              </a>
              <span className="share-text"><i className="icon-share"></i> SHARE</span>
            </div>

            <div className="tpproduct__details-availability mb-20">
              Availability: <span>{product.quantity} in stock</span>
            </div>

            <div className="tpproduct__details-categories-tags mb-20">
              Categories: <Link href={`/shop?category=${product.category?.slug?.current || ''}`}>{product.category?.name || 'Uncategorized'}</Link>
              {product.tags && product.tags.length > 0 && (
                <>
                , Tags: {product.tags.map((tag, index) => (
                  <Link key={index} href={`/shop?tag=${tag}`}>{tag}{index < product.tags.length - 1 ? ', ' : ''}</Link>
                ))}
                </>
              )}
            </div>

            <div className="tpproduct__details-payment-info mt-30">
              <Image src="/assets/img/icon/payment-method.png" alt="payment" width={220} height={25} />
              <p className="secure-checkout mt-10">Guarantee safe & Secure checkout</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="related-products-section mt-50">
          <h3 className="related-products-title mb-30">Related Products</h3>
          <div className="row">
            {relatedProducts.map((p) => (
              <div className="col-lg-3 col-md-6 col-sm-6 mb-30" key={p._id}>
                <ProductSmSingle product={p} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs Section */}
      <div className="tpproduct__details-tab-wrapper mt-50">
        <div className="tpproduct__details-tab-nav">
          <ul className="nav nav-tabs" id="myTab" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
                type="button"
              >
                PRODUCT DESCRIPTION
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'additional' ? 'active' : ''}`}
                onClick={() => setActiveTab('additional')}
                type="button"
              >
                ADDITIONAL INFORMATION
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
                type="button"
              >
                REVIEWS ({product.reviews?.length || 0})
              </button>
            </li>
          </ul>
        </div>
        <div className="tab-content" id="myTabContent">
          <div className={`tab-pane fade ${activeTab === 'description' ? 'show active' : ''}`} role="tabpanel">
            <div className="tpproduct__details-description-content">
              {product.description && <PortableText value={product.description} />}
            </div>
          </div>
          <div className={`tab-pane fade ${activeTab === 'additional' ? 'show active' : ''}`} role="tabpanel">
            <div className="tpproduct__details-additional-content">
              {product.additionalInfo && <PortableText value={product.additionalInfo} />}
            </div>
          </div>
          <div className={`tab-pane fade ${activeTab === 'reviews' ? 'show active' : ''}`} role="tabpanel">
            <div className="tpproduct__details-reviews-content">
              {product.reviews && product.reviews.length > 0 ? (
                <ul>
                  {product.reviews.map((review, index) => (
                    <li key={index} className="mb-20">
                      <strong>{review.reviewerName}</strong> - {new Date(review._createdAt).toLocaleDateString()}
                      <Rating size={16} initialValue={review.rating} readonly={true} />
                      <p>{review.comment}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;