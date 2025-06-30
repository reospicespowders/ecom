import React from 'react';
import { InventoryStatus } from './InventoryStatus';
import AddToCartButton from './AddToCartButton';
import Link from 'next/link';
import { ProductWithInventory } from '@/hooks/useRealTimeInventory';
import Image from 'next/image';

interface ProductCardProps {
  product: ProductWithInventory;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {product.product.image && (
        <div className="aspect-square overflow-hidden">
          <Link href={`/shop/${product.product.category?.slug}/${product.product.slug}`}>
            <Image
              src={product.product.image}
              alt={product.product.title}
              width={300}
              height={300}
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
      )}
      
      <div className="mt-4">
        <div className="text-xs text-gray-500">{product.product.category?.name}</div>
        <h3 className="font-semibold text-lg line-clamp-2">
          <Link href={`/shop/${product.product.category?.slug}/${product.product.slug}`}>
            {product.product.title}
          </Link>
        </h3>
        <div className="mt-2 flex justify-between items-center">
          <div>
            <span className="text-xl font-bold">${product.product.price}</span>
            {product.product.sale_price && (
              <span className="text-sm text-gray-500 line-through ml-2">${product.product.sale_price}</span>
            )}
          </div>
          <InventoryStatus inventory={product.inventory} />
        </div>
        <div className="mt-4">
          <AddToCartButton product={product.product} />
        </div>
      </div>
    </div>
  );
} 