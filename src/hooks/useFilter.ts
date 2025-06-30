'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@/redux/hook';
import { useProducts } from '@/hooks/useProducts';
import { IProductData } from '@/types/product-d-t';
import { useSearchParams } from 'next/navigation';

export function useProductFilter(initialCategorySlug?: string) {
  const { category, subCategory, brand, priceValue, ratingValue, colors } = useAppSelector((state) => state.filter);
  const searchParams = useSearchParams();
  const searchText = searchParams?.get("searchText") ?? "";

  // Fetch products using the useProducts hook
  const { products: fetchedProducts, isLoading, isError } = useProducts(initialCategorySlug || category, searchText);

  // Client-side filtering from the fetched products
  const filteredProducts = useMemo(() => {
    let currentFilteredData = fetchedProducts;

    // Further client-side filtering if needed
    if (brand) {
      currentFilteredData = currentFilteredData.filter((p: IProductData) => p.brand?.toLowerCase() === brand.toLowerCase());
    }
    if (priceValue) {
      currentFilteredData = currentFilteredData.filter((p: IProductData) => p.price >= priceValue[0] && p.price <= priceValue[1]);
    }
    // Add other client-side filters here if necessary

    return currentFilteredData;
  }, [fetchedProducts, brand, priceValue]);

  // The sorting logic can be simplified or moved to the component
  const [sortedProducts, setSortedProducts] = useState<IProductData[]>([]);
  useEffect(() => {
    setSortedProducts(filteredProducts);
  }, [filteredProducts]);

  const handleSorting = (item: { value: string; label: string }) => {
    let sorted = [...filteredProducts];
    if (item.value === "new") {
      // Assuming fetchedProducts are already sorted by date, reverse for 'new'
      sorted.reverse();
    } else if (item.value === "high") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (item.value === "low") {
      sorted.sort((a, b) => a.price - b.price);
    }
    setSortedProducts(sorted);
  };

  return {
    products: sortedProducts,
    isLoading,
    isError,
    handleSorting,
  };
}