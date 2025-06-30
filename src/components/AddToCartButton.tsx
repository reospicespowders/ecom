'use client';
import { useState } from 'react';
import { useRealTimeInventory, SanityProduct } from '@/hooks/useRealTimeInventory';
import { useUser } from '@clerk/nextjs';

interface AddToCartButtonProps {
  product: SanityProduct;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product }) => {
  const { data, loading, error, reserveStock } = useRealTimeInventory(product._id);
  const { user } = useUser();
  const [isReserving, setIsReserving] = useState(false);

  const handleAddToCart = async () => {
    if (!data?.inventory?.in_stock || !user) return;

    try {
      setIsReserving(true);
      const cartId = `cart_${user.id}_${Date.now()}`;
      await reserveStock(1, cartId);
      // In a real app, you would now likely dispatch to Redux or a context
      // to update the global cart state. For now, we just log it.
      console.log('Reserved stock for product:', product._id);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setIsReserving(false);
    }
  };

  if (loading) {
    return (
      <button className="tp-btn-2" disabled>
        Checking Stock...
      </button>
    );
  }

  if (error) {
    return (
      <button className="tp-btn-2" disabled>
        Error
      </button>
    );
  }

  if (!data) return null;

  const isDisabled = !data.inventory?.in_stock || isReserving;

  return (
    <button
      className="tp-btn-2"
      onClick={handleAddToCart}
      disabled={isDisabled}
    >
      {isReserving ? 'Adding...' : 
       !data.inventory?.in_stock ? 'Out of Stock' : 
       'Add to Cart'}
    </button>
  );
};

export default AddToCartButton; 