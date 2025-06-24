"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IProductData } from "@/types/product-d-t";

type IProps = {
  product: IProductData & { cartId: string };
  onUpdate: () => void;
};

const CartItem = ({ product, onUpdate }: IProps) => {
  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      const response = await fetch(`/api/cart/${product.cartId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (!response.ok) throw new Error('Failed to update quantity');
      onUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveItem = async () => {
    try {
      const response = await fetch(`/api/cart/${product.cartId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove item');
      onUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <tr>
      <td className="product-thumbnail">
        <Link href={`/shop-details/${product.slug}`}>
          <Image
            src={product.image}
            width={125}
            height={125}
            alt="cart-img"
          />
        </Link>
      </td>
      <td className="product-name">
        <Link href={`/shop-details/${product.slug}`}>{product.title}</Link>
      </td>
      <td className="product-price">
        {product.sale_price ? (
          <span className="amount">${product.sale_price.toFixed(2)}</span>
        ) : (
          <span className="amount">${product.price.toFixed(2)}</span>
        )}
      </td>
      <td className="product-quantity">
        <span
          onClick={() => handleUpdateQuantity((product.orderQuantity || 1) - 1)}
          className="cart-minus"
        >
          -
        </span>
        <input
          className="cart-input"
          type="text"
          value={product.orderQuantity}
          readOnly
        />
        <span
          onClick={() => handleUpdateQuantity((product.orderQuantity || 0) + 1)}
          className="cart-plus"
        >
          +
        </span>
      </td>
      {product.orderQuantity && (
        <td className="product-subtotal">
          <span className="amount">
            $
            {product.sale_price
              ? (product.sale_price * product.orderQuantity).toFixed(2)
              : (product.price * product.orderQuantity).toFixed(2)}
          </span>
        </td>
      )}
      <td className="product-remove">
        <a onClick={handleRemoveItem} className="pointer">
          <i className="fa fa-times"></i>
        </a>
      </td>
    </tr>
  );
};

export default CartItem;
