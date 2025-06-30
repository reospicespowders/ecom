'use client';

import { useProducts } from '@/hooks/useProducts';
import ProductCard from './product-card';

interface IProps {
  categorySlug?: string;
}

const ProductArea = ({ categorySlug }: IProps) => {
  const { products, isLoading, isError } = useProducts(categorySlug);

  if (isLoading) {
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

  if (isError || products.length === 0) {
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
      {products.map((product: any) => (
        <div key={product._id} className="col-xl-3 col-lg-4 col-sm-6">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductArea; 