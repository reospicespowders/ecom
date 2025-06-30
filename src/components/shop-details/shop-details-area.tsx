"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Rating } from "react-simple-star-rating";
import { IProductData } from "@/types/product-d-t";
import { averageRating, isHot } from "@/utils/utils";
import ReviewForm from "@/components/product/review-form/ReviewForm";
import { Video } from "../svg";
import VideoPopup from "../common/modal/video-popup";
import ShopDetailsUpper from "./shop-details-upper";
import Link from "next/link";
import { PortableText } from '@portabletext/react';
import { getProductsByCategory } from "@/lib/sanity.fetch";
import ProductSmSingle from "@/components/product/product-single/product-sm-single";
import ReviewDisplay from "@/components/product/review-display/ReviewDisplay";

// prop type
type IProps = {
  product: IProductData;
  relatedProducts: IProductData[];
  navStyle?: boolean;
  topThumb?: boolean;
  revalidate: (categorySlug: string, productSlug: string) => Promise<void>;
};
const ShopDetailsArea = ({ product, relatedProducts, navStyle = false, topThumb = false, revalidate }: IProps) => {
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false);
  const { brand, category, gallery, reviews, price, color, quantity, tags, sale_price, description, additionalInfo, productInfoList, videoId } = product;

  const handleReviewSubmitted = () => {
    revalidate(product.category?.slug.current || 'uncategorized', product.slug);
  };

  return (
    <>
      <section className="shopdetails-area grey-bg pb-50">
        <div className="container">
          <div className="row">
            <div className="col-lg-9 col-md-12">
              <div className="tpdetails__area pb-30">
                {/* shop details upper */}
                <ShopDetailsUpper product={product} navStyle={navStyle} topThumb={topThumb} />
                {/* shop details upper */}
                <div className="tp-product-details-tab-area mb-45">
                  <div className="tp-product-details-tab-nav">
                    <nav>
                      <div className="nav nav-tabs justify-content-center" id="nav-tab" role="tablist">
                        <button
                          className="nav-link active"
                          id="nav-description-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#nav-description"
                          type="button"
                          role="tab"
                          aria-controls="nav-description"
                          aria-selected="true"
                        >
                          Description
                        </button>
                        <button
                          className="nav-link"
                          id="nav-additional-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#nav-additional"
                          type="button"
                          role="tab"
                          aria-controls="nav-additional"
                          aria-selected="false"
                        >
                          Additional information
                        </button>
                        <button
                          className="nav-link"
                          id="nav-reviews-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#nav-reviews"
                          type="button"
                          role="tab"
                          aria-controls="nav-reviews"
                          aria-selected="false"
                        >
                          Reviews ({reviews?.length || 0})
                        </button>
                      </div>
                    </nav>
                  </div>
                  <div className="tab-content" id="nav-tabContent">
                    <div
                      className="tab-pane fade show active"
                      id="nav-description"
                      role="tabpanel"
                      aria-labelledby="nav-description-tab"
                    >
                      <div className="tp-product-details-desc-wrapper mt-25">
                        {description && <PortableText value={description} />}
                        {videoId && 
                          <div className="tpdescription__video-wrapper p-relative mt-30 mb-35 w-img">
                            <Image src="/assets/img/product/product-video1.jpg" width={1036} height={302} alt="" style={{height: "auto"}}/>
                            <div className="tpvideo__video-btn">
                              <a className="tpvideo__video-icon pointer popup-video" onClick={()=> setIsVideoOpen(true)}>
                                  <i>
                                    <Video/>
                                  </i>
                              </a>
                            </div>
                        </div>
                        }
                      </div>
                    </div>
                    <div
                      className="tab-pane fade"
                      id="nav-additional"
                      role="tabpanel"
                      aria-labelledby="nav-additional-tab"
                    >
                      <div className="tp-product-details-additional-info pt-25">
                        {additionalInfo && <PortableText value={additionalInfo} />}
                        {productInfoList && productInfoList.length > 0 && (
                          <ul className="tpdescription__product-info mt-20">
                            {productInfoList.map((info, index) => (
                              <li key={index}>{info.title}: {info.value}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div
                      className="tab-pane fade"
                      id="nav-reviews"
                      role="tabpanel"
                      aria-labelledby="nav-reviews-tab"
                    >
                      <div className="tp-product-details-review-wrapper pt-25">
                        <div className="row">
                          <div className="col-lg-6">
                            <div className="tp-product-details-review-avata">
                              <div className="tp-product-details-review-avata-thumb">
                                {/* Removed user image as per UI */}
                              </div>
                              <ReviewDisplay reviews={reviews || []} />
                            </div>
                          </div>
                          <div className="col-lg-6">
                            <div className="tp-product-details-review-form">
                              <ReviewForm productId={product._id} onReviewSubmitted={handleReviewSubmitted} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-12">
              <div className="tpsidebar pb-30" style={{ marginLeft: '0', width: '100%', paddingLeft: '20px', paddingRight: '20px' }}>
                <div className="tpsidebar__warning mb-30">
                  <ul>
                    <li>
                      <div className="tpsidebar__warning-item">
                        <div className="tpsidebar__warning-icon">
                          <i className="icon-package"></i>
                        </div>
                        <div className="tpsidebar__warning-text">
                          <p>
                            Free shipping apply to all <br /> orders over $90
                          </p>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="tpsidebar__warning-item">
                        <div className="tpsidebar__warning-icon">
                          <i className="icon-shield"></i>
                        </div>
                        <div className="tpsidebar__warning-text">
                          <p>
                            Guaranteed 100% Organic <br /> from nature farms
                          </p>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="tpsidebar__warning-item">
                        <div className="tpsidebar__warning-icon">
                          <i className="icon-package"></i>
                        </div>
                        <div className="tpsidebar__warning-text">
                          <p>
                            60 days returns if you change <br /> your mind
                          </p>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="tpsidebar__banner mb-30">
                  <Image
                    src="/assets/img/shape/sidebar-product-1.png"
                    alt="product-img"
                    width={270}
                    height={460}
                    style={{ height: "auto" }}
                  />
                </div>
                <div className="tpsidebar__product">
                  <h4 className="tpsidebar__title mb-15">Recent Products</h4>
                  {relatedProducts.slice(0, 2).map((item) => (
                    <div key={item._id} className="tp-shop-widget-product d-flex pb-25 mb-20">
                      <div className="tp-shop-widget-product-thumb mr-20">
                        <Link href={`/shop/${item.category?.slug.current}/${item.slug}`}>
                          <Image src={item.image} alt={item.title} width={70} height={70} />
                        </Link>
                      </div>
                      <div className="tp-shop-widget-product-content">
                        <span className="tpproduct__product-category">
                          <Link href={`/shop/${item.category?.slug.current}/${item.slug}`}>
                            {item.category?.name}
                          </Link>
                        </span>
                        <h4 className="tpsidebar__product-title">
                          <Link href={`/shop/${item.category?.slug.current}/${item.slug}`}>{item.title}</Link>
                        </h4>
                        <div className="tp-shop-widget-product-rating-box">
                          <Rating
                            allowFraction
                            size={16}
                            initialValue={averageRating(item.reviews)}
                            readonly={true}
                          />
                        </div>
                        <div className="tpshop-widget-product-price">
                          {item.sale_price ? (
                            <span className="tp-product-price-2">
                              ${item.sale_price.toFixed(2)}
                            </span>
                          ) : (
                            <span className="tp-product-price-2">
                              ${item.price.toFixed(2)}
                            </span>
                          )}
                          {item.sale_price && (
                            <del>
                              <span className="tp-product-price-2 old-price">
                                ${item.price.toFixed(2)}
                              </span>
                            </del>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
        </div>
      </section>

      {/* video modal start */}
      <VideoPopup
        isVideoOpen={isVideoOpen}
        setIsVideoOpen={setIsVideoOpen}
        videoId={videoId ? videoId : ""}
      />
      {/* video modal end */}
    </>
  );
};

export default ShopDetailsArea;
