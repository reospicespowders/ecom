'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IProductData } from '@/types/product-d-t';
import ProductBrandSingle from '../product-single/product-sm-single';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

const ProductBrandFeature = ({ brandProducts }: { brandProducts: IProductData[] }) => {
  const selectedBrand = 'REO Spices and Powders';

  const slider_setting = {
    slidesPerView: 4,
    spaceBetween: 20,
    observer: true,
    observeParents: true,
    breakpoints: {
      '1200': {
        slidesPerView: 4,
      },
      '992': {
        slidesPerView: 3,
      },
      '768': {
        slidesPerView: 2,
      },
      '576': {
        slidesPerView: 1,
      },
      '0': {
        slidesPerView: 1,
      },
    },
    navigation: {
      nextEl: '.tpbrandproduct-btn__nxt',
      prevEl: '.tpbrandproduct-btn__prv',
    }
  };

  return (
    <section className="brand-product grey-bg pb-60">
      <div className="container">
        <div className="sections__wrapper white-bg pl-50 pr-50 pb-40 brand-product">
          <div className="row align-items-center">
            <div className="col-md-6 text-center">
              <div className="tpsection mb-15">
                <h4 className="tpsection__title text-start brand-product-title">Featured Brand Products</h4>
              </div>
            </div>
            <div className="col-md-6">
              <div className="tpproduct__all-item">
                <Link href="/shop">View All <i className="icon-chevron-right"></i></Link>
              </div>
            </div>
          </div>
          <div className="row gx-3">
            <div className="col-lg-3">
              <div className="tpbrandproduct__main text-center">
                <div className="tpbrandproduct__main-thumb mb-20">
                  <Image 
                    src="/assets/img/brand/REO-brand.png" 
                    alt={selectedBrand}
                    width={200}
                    height={200}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
                <div className="tpbrandproduct__main-contetn">
                  <h4 className="tpbrandproduct__title">{selectedBrand}</h4>
                  <p>Discover our premium selection of authentic spices and powders, featuring the finest quality and best value for your culinary needs.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-9">
              <div className="tpbrandproduct__arrow p-relative">
                {brandProducts.length > 0 ? (
                  <Swiper {...slider_setting} modules={[Navigation]} className="swiper-container tpbrandproduct-active tpslider-bottom p-relative">
                    {brandProducts.slice(0, 8).map((product) => (
                      <SwiperSlide key={product._id}>
                        <ProductBrandSingle product={product} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <p>No products found for this brand.</p>
                )}
                <div className="tpbrandproduct-btn">
                  <div className="tpprduct-arrow tpbrandproduct-btn__prv"><a href="#"><i className="icon-chevron-left"></i></a></div>
                  <div className="tpprduct-arrow tpbrandproduct-btn__nxt"><a href="#"><i className="icon-chevron-right"></i></a></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductBrandFeature;