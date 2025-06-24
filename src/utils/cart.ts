export const handleAddToCart = async (productId: string, quantity: number, getToken: () => Promise<string | null>) => {
  console.log('handleAddToCart called', productId, quantity);
  const token = await getToken();
  if (!token) {
    alert('Please sign in to add items to your cart.');
    return;
  }

  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity }),
      credentials: 'include',
    });

    if (response.ok) {
      alert('Product added to cart!');
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } else {
      const data = await response.json();
      alert(`Failed to add product to cart: ${data.error}`);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('An unexpected error occurred while adding the product to the cart.');
  }
}; 