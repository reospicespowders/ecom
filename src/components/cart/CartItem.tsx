'use client'
import { ICartItemWithProduct } from './CartArea';

interface CartItemProps {
  item: ICartItemWithProduct;
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onRemoveItem: (itemId: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity > 0) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <tr>
      <td className="product-thumbnail">
        <a href={`/shop/${item.product.category?.slug?.current || 'uncategorized'}/${item.product.slug}`}>
          <img src={item.product.image} alt={item.product.title} style={{ width: '100px' }}/>
        </a>
      </td>
      <td className="product-name"><a href={`/shop/${item.product.category?.slug?.current || 'uncategorized'}/${item.product.slug}`}>{item.product.title}</a></td>
      <td className="product-price"><span className="amount">${item.product.sale_price ?? item.product.price}</span></td>
      <td className="product-quantity">
        <div className="cart-plus-minus">
          <input type="number" value={item.quantity} onChange={handleQuantityChange} min="1" />
        </div>
      </td>
      <td className="product-subtotal"><span className="amount">${(item.product.sale_price ?? item.product.price) * item.quantity}</span></td>
      <td className="product-remove">
        <button onClick={() => onRemoveItem(item.id)}><i className="fa fa-times"></i></button>
      </td>
    </tr>
  );
};

export default CartItem; 