'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getProductsByBrand } from '@/lib/sanity.fetch';
import { IProductData } from '@/types/product-d-t';
import ProductBrandSingle from '../product-single/product-sm-single';

const ProductBrandFeature = () => {
  const [brandProducts, setBrandProducts] = useState<IProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedBrand = 'REO Spices and Powders';

  useEffect(() => {
    async function fetchBrandProducts() {
      setLoading(true);
      try {
        const products = await getProductsByBrand(selectedBrand);
        console.log('Fetched brand products:', products); // Debug log
        setBrandProducts(products);
      } catch (error) {
        console.error('Failed to fetch brand products:', error);
        setBrandProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBrandProducts();
  }, []);

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
              <div className="row gx-3">
                {loading ? (
                  <div className="col-12 text-center">
                    <p>Loading products...</p>
                  </div>
                ) : brandProducts.length > 0 ? (
                  brandProducts.slice(0, 6).map((product) => (
                    <div key={product._id} className="col-xl-4 col-lg-6">
                      <ProductBrandSingle product={product} />
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center">
                    <p>No products found for this brand.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductBrandFeature;