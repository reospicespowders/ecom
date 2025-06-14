'use client';
import React, { useEffect, useState } from "react";
import { getProducts } from "@/lib/sanity.fetch";
import { discountPercentage, isHot } from "@/utils/utils";
import ProductSmSingle from "../product-single/product-sm-single";
import { IProductData } from "@/types/product-d-t";

const BestProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const fetchedProducts = await getProducts();
        setProducts(
          fetchedProducts.filter(
            (p: IProductData) =>
              discountPercentage(p.price, p.sale_price!) > 0 || isHot(p.updated_at)
          )
        );
      } catch (error) {
        console.error("Failed to fetch best products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <section className="brand-product pt-75 pb-60">
      <div className="container">
        <div className="white-bg pb-40 brand-product">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="tpsection mb-35">
                <h4 className="tpsection__sub-title">~ Best Products ~</h4>
                <h4 className="tpsection__title">This week&apos;s highlights</h4>
                <p>
                  The liber tempor cum soluta nobis eleifend option congue
                  doming quod mazim.
                </p>
              </div>
            </div>
          </div>
          <div className="row gx-3">
            {loading ? (
              <p>Loading products...</p>
            ) : products.length > 0 ? (
              products.slice(0,9).map((p, i) => (
                <div key={i} className="col-xl-4 col-md-6 col-sm-12">
                  <ProductSmSingle product={p} />
                </div>
              ))
            ) : (
              <p>No best products found.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestProducts;
