"use client";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import ProductSingle from "./product-single/product-single";
import { getProductsByCategory } from '@/lib/sanity.fetch';
import { IProductData } from '@/types/product-d-t';

// slider setting
const slider_setting = {
  loop: true,
  slidesPerView: 5,
  spaceBetween: 20,
  observer: true,
  observeParents: true,
  autoplay: {
    delay: 5000,
    disableOnInteraction: true,
  },
  breakpoints: {
    "1200": {
      slidesPerView: 5,
    },
    "992": {
      slidesPerView: 4,
    },
    "768": {
      slidesPerView: 3,
    },
    "576": {
      slidesPerView: 1,
    },
    "0": {
      slidesPerView: 1,
    },
  },
  navigation: {
    nextEl: ".tpproduct-btn__nxt",
    prevEl: ".tpproduct-btn__prv",
  },
};
// prop type
type IProps = {
  product: IProductData;
};

const RelatedProducts = ({ product }: IProps) => {
  const [relatedProducts, setRelatedProducts] = useState<IProductData[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (product.category?.slug?.current) {
        const fetchedProducts = await getProductsByCategory(product.category.slug.current);
        setRelatedProducts(fetchedProducts.filter((p: IProductData) => p._id !== product._id));
      }
    };
    fetchRelated();
  }, [product.category?.slug, product._id]);

  if (relatedProducts.length === 0) return null;

  return (
    <section className="product-area whight-product pt-75 pb-80">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <h5 className="tpdescription__product-title mb-20">
              Related Products
            </h5>
          </div>
        </div>
        <div className="tpproduct__arrow double-product p-relative">
          <Swiper
            {...slider_setting}
            modules={[Navigation]}
            className="swiper-container tpproduct-active tpslider-bottom p-relative"
          >
            {relatedProducts.map((related, index) => (
              <SwiperSlide key={related._id || index}>
                <ProductSingle product={related} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
