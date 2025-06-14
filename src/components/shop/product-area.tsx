'use client';

import { useEffect, useState } from 'react';
import { IProductData } from '@/types/product-d-t';
import { getProducts, getProductsByCategory } from '@/lib/sanity.fetch';
import ProductCard from './product-card';

interface IProps {
  categorySlug?: string;
}

const ProductArea = ({ categorySlug }: IProps) => {
  const [products, setProducts] = useState<IProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let data;
        if (categorySlug) {
          data = await getProductsByCategory(categorySlug);
        } else {
          data = await getProducts();
        }
        console.log('Fetched products:', data); // Debug log
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="row">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="col-xl-3 col-lg-4 col-sm-6">
            <div className="product-card-skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-title"></div>
              <div className="skeleton-price"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="alert alert-info">No products found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {products.map((product) => (
        <div key={product._id} className="col-xl-3 col-lg-4 col-sm-6">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductArea; 