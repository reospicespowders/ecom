'use client'
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { getProducts } from '@/lib/sanity.fetch';
import ProductSingle from '../product-single/product-single';

// slider setting
const slider_setting = {
   slidesPerView: 6,
   spaceBetween: 20,
   observer: true,
   observeParents: true,
   autoplay: {
      delay: 5000,
      disableOnInteraction: true,
   },
   breakpoints: {
      '1200': {
         slidesPerView: 6,
      },
      '992': {
         slidesPerView: 4,
      },
      '768': {
         slidesPerView: 3,
      },
      '576': {
         slidesPerView: 1,
      },
      '0': {
         slidesPerView: 1,
      },
   },
   navigation: {
      nextEl: '.tpproduct-btn__nxt',
      prevEl: '.tpproduct-btn__prv',
   }
}

const ProductArea = () => {
   const [products, setProducts] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     async function fetchProducts() {
       setLoading(true);
       try {
         const fetchedProducts = await getProducts();
         setProducts(fetchedProducts.slice(-10)); // Still applying slice as per original logic
       } catch (error) {
         console.error("Failed to fetch products:", error);
         setProducts([]);
       } finally {
         setLoading(false);
       }
     }
     fetchProducts();
   }, []);

  return (
    <>
     <section className="product-area grey-bg pb-0">
            <div className="container">
               <div className="row">
                  <div className="col-lg-12 text-center">
                     <div className="tpsection mb-35">
                        <h4 className="tpsection__sub-title">~ Special Products ~</h4>
                        <h4 className="tpsection__title">Weekly Food Offers</h4>
                        <p>The liber tempor cum soluta nobis eleifend option congue doming quod mazim.</p>
                     </div>
                  </div>
               </div>
               <div className="tpproduct__arrow p-relative">
                  {loading ? (
                    <p>Loading products...</p>
                  ) : products.length > 0 ? (
                    <Swiper {...slider_setting} modules={[Navigation]} className="swiper-container tpproduct-active tpslider-bottom p-relative">
                       {products.map((product, index) => (
                          <SwiperSlide key={index}>
                             <ProductSingle product={product} />
                          </SwiperSlide>
                       ))}
                    </Swiper>
                  ) : (
                    <p>No products found.</p>
                  )}
                  <div className="tpproduct-btn">
                     <div className="tpprduct-arrow tpproduct-btn__prv"><a href="#"><i className="icon-chevron-left"></i></a></div>
                     <div className="tpprduct-arrow tpproduct-btn__nxt"><a href="#"><i className="icon-chevron-right"></i></a></div>
                  </div>
               </div>
            </div>
         </section>
    </>
  );
};

export default ProductArea;