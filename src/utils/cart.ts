import { toast } from 'react-toastify';

export const handleAddToCart = async (productId: string, quantity: number, getToken: () => Promise<string | null>) => {
  console.log('handleAddToCart called', productId, quantity);
  const token = await getToken();
  if (!token) {
    toast.error('Please sign in to add items to your cart.');
    return;
  }

  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity, jwt: token }),
      credentials: 'include',
    });

    if (response.ok) {
      toast.success('Product added to cart!');
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } else {
      const data = await response.json();
      toast.error(`Failed to add product to cart: ${data.error}`);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    toast.error('An unexpected error occurred while adding the product to the cart.');
  }
};

export const handleToggleWishlist = async (
  productId: string,
  getToken: () => Promise<string | null>,
  isWishlisted: boolean
) => {
  const token = await getToken();
  if (!token) {
    toast.error('Please sign in to manage your wishlist.');
    return;
  }

  try {
    const response = await fetch(`/api/wishlist${isWishlisted ? `/${productId}` : ''}`, {
      method: isWishlisted ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: isWishlisted ? undefined : JSON.stringify({ product_id: productId }),
    });

    if (response.ok) {
      toast.success(isWishlisted ? 'Product removed from wishlist!' : 'Product added to wishlist!');
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      return true;
    } else {
      const data = await response.json();
      toast.error(`Failed to update wishlist: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.error('Error updating wishlist:', error);
    toast.error('An unexpected error occurred while updating the wishlist.');
    return false;
  }
}; 