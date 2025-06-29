import React, { useState } from 'react';
import { useRealTimeInventory } from '@/hooks/useRealTimeInventory';
import { useUser } from '@clerk/nextjs';

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  onAddToCart?: (productId: string, quantity: number) => void;
  className?: string;
}

export function AddToCartButton({ 
  productId, 
  quantity = 1, 
  onAddToCart,
  className = ''
}: AddToCartButtonProps) {
  const { data, reserveStock } = useRealTimeInventory(productId);
  const { user } = useUser();
  const [isReserving, setIsReserving] = useState(false);

  const handleAddToCart = async () => {
    if (!data?.inventory.in_stock || !user) return;

    try {
      setIsReserving(true);
      
      // Reserve stock when adding to cart
      const cartId = `cart_${user.id}_${Date.now()}`;
      await reserveStock(quantity, cartId);
      
      // Call parent callback
      onAddToCart?.(productId, quantity);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setIsReserving(false);
    }
  };

  if (!data) return null;

  const isDisabled = !data.inventory.in_stock || isReserving;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={`
        px-6 py-2 rounded-lg font-medium transition-colors
        ${isDisabled 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
        }
        ${className}
      `}
    >
      {isReserving ? 'Adding...' : 
       !data.inventory.in_stock ? 'Out of Stock' : 
       'Add to Cart'}
    </button>
  );
} 