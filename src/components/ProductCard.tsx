import React from 'react';
import { InventoryStatus } from './InventoryStatus';
import { AddToCartButton } from './AddToCartButton';

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    price: number;
    image?: string;
    description?: string;
    category?: {
      name: string;
    };
  };
  onAddToCart?: (productId: string, quantity: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {product.image && (
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
          <span className="font-bold text-xl text-green-600">
            ${product.price}
          </span>
        </div>
        
        {product.category && (
          <div className="mb-2">
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {product.category.name}
            </span>
          </div>
        )}
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="space-y-2">
          {/* Inventory Status */}
          <InventoryStatus productId={product._id} />
          
          {/* Add to Cart Button */}
          <AddToCartButton
            productId={product._id}
            onAddToCart={onAddToCart}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
} 