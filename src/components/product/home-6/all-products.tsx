'use client';
import React, { useEffect, useState } from 'react';
import { getProducts } from '@/lib/sanity.fetch';
import { discountPercentage, isHot } from '@/utils/utils';
import ProductSingle from '../product-single/product-single';
import { Swiper, SwiperSlide } from 'swiper/react';

// slider setting 
const slider_setting = {
  slidesPerView: 1,
  spaceBetween: 20,
  observer: true,
  observeParents: true,
  autoplay: {
    delay: 5000,
    disableOnInteraction: true,
  }
}

const HighlightProducts = () => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllProducts() {
      setLoading(true);
      try {
        const products = await getProducts();
        setAllProducts(products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAllProducts();
  }, []);

  const products = allProducts.filter(
    (p) => discountPercentage(p.price, p.sale_price!) > 0 || isHot(p.updated_at)
  ).slice(0, 8);

  const offer_products = allProducts.filter(
    (p) => (p.offerDate && typeof p.offerDate === 'object' && (p.offerDate as any).end) ? new Date((p.offerDate as any).end) > new Date() : false
  );

  return (
<section className="product-area whight-product green-product-border pb-50">
            <div className="container">
               <div className="row">
                  <div className="col-lg-12 text-center">
                     <div className="tpsection mb-35">
                        <h4 className="tpsection__sub-title">~ Best Products ~</h4>
                        <h4 className="tpsection__title">This week&apos;s highlights</h4>
                        <p>The liber tempor cum soluta nobis eleifend option congue doming quod mazim.</p>
                     </div>
                  </div>
               </div>
               <div className="row">
                  <div className="col-xl-8 col-lg-12">
                     <div className="tpproduct__arrow double-product p-relative mb-30">
                        <div className="tpproduct-active-5 tpslider-bottom p-relative">
                        <div className="row">
            {loading ? (
              <p>Loading products...</p>
            ) : products.length > 0 ? (
              products.slice(0,9).map((p, i) => (
                <div key={i} className="col-xl-3 col-md-4 col-sm-12 mb-30">
                  <ProductSingle product={p} />
                </div>
              ))
            ) : (
              <p>No highlighted products found.</p>
            )}
          </div>
                        </div>
                     </div>
                  </div>
                  <div className="col-xl-4 col-lg-12">
                     <div className="tpproduct__arrow double-product p-relative">
                        <Swiper {...slider_setting} className="swiper-container tpproduct-active-6 tpslider-bottom p-relative">
                        {loading ? (
                          <p>Loading offers...</p>
                        ) : offer_products.length > 0 ? (
                          offer_products.map((product, index) => (
                            <SwiperSlide key={index}>
                              <ProductSingle product={product} cls='green-border mb-30' offer_style={true} progress={true} price_space='mb-25' />
                            </SwiperSlide>
                          ))
                        ) : (
                          <p>No offers found.</p>
                        )}
                        </Swiper>
                     </div>
                  </div>
               </div>
            </div>
         </section>
  );
};

export default HighlightProducts;