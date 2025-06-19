'use client';
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/hook';
import { averageRating } from '@/utils/utils';
import { IProductData } from '@/types/product-d-t';
import { useSearchParams } from 'next/navigation';
import { getProducts, getProductsByCategory } from '@/lib/sanity.fetch';
import React from 'react';

export function useProductFilter(initialCategorySlug?: string) {
  const [products, setProducts] = useState<IProductData[]>([]);
  const { category, subCategory, sizes, colors, brand, priceValue, ratingValue } = useAppSelector((state) => state.filter);
  const searchParams = useSearchParams();
  const searchText = searchParams?.get("searchText") ?? "";

  // Fetch products from Sanity
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let data;
        if (initialCategorySlug) {
          data = await getProductsByCategory(initialCategorySlug);
        } else {
          data = await getProducts();
        }
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [initialCategorySlug]);

  // Memoized filtering logic
  const filteredProducts = React.useMemo(() => {
    let currentFilteredData = [...products];

    // Filter by category and subCategory
    if (!initialCategorySlug) {
      currentFilteredData = currentFilteredData.filter((p) =>
        (category && !subCategory) ? p.category?.name?.toLowerCase() === category.toLowerCase() :
          (!category && subCategory) ? p.category?.name?.toLowerCase() === subCategory.toLowerCase() :
            (category && subCategory) ? p.category?.name?.toLowerCase() === category.toLowerCase() && p.category?.name?.toLowerCase() === subCategory.toLowerCase() :
            true
      );
    }

    // Filter by price range
    currentFilteredData = currentFilteredData.filter((p) => p.price >= priceValue[0] && p.price <= priceValue[1]);

    // Filter by colors
    currentFilteredData = currentFilteredData.filter((p) => {
        if (colors.length > 0 && p.color) {
        return (Array.isArray(p.color) ? p.color : [p.color]).some((c) => colors.includes(c));
        }
        return true;
    });

    // Filter by brand
    currentFilteredData = currentFilteredData.filter((p) => {
        if (brand) {
        return p.brand?.toLowerCase() === brand.toLowerCase();
        }
        return true;
    });

    // Filter by rating
    currentFilteredData = currentFilteredData.filter((p) => {
        if (ratingValue) {
          return averageRating(p.reviews) >= ratingValue;
        }
        return true;
      });

    // Filter by search text
    const titleMatch = (item: IProductData) => {
      return (
        !searchText || item.title.toLowerCase().includes(searchText.toLowerCase())
      );
    };

    currentFilteredData = currentFilteredData.filter((item) => titleMatch(item));

    return currentFilteredData;
  }, [products, category, subCategory, colors, brand, priceValue, ratingValue, searchText]);

  const handleSorting = (item: { value: string; label: string }) => {
    let sortedProducts = [...filteredProducts]; // Sort the currently filtered products
    if (item.value === "new") {
      sortedProducts.reverse();
    } else if (item.value === "high") {
      sortedProducts.sort((a, b) => b.price - a.price);
    } else if (item.value === "low") {
      sortedProducts.sort((a, b) => a.price - b.price);
    }
    setProducts(sortedProducts); // This will update the raw products, which will re-trigger memo and filtering
  };

  // Return filteredProducts instead of products from state
  return {
    products: filteredProducts,
    setProducts: (data: IProductData[]) => setProducts(data), // Allow external components to update raw products if needed
    handleSorting,
  }
}