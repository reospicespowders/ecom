"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IProductData } from "@/types/product-d-t";
import { useSession } from '@clerk/nextjs';

type IProps = {
  product: IProductData & { cartId: string };
  onUpdate: () => void;
};

const CartItem = ({ product, onUpdate }: IProps) => {
  const { session } = useSession();

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      const token = await session?.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`/api/cart/${product.cartId}`, {
        method: 'PATCH',
        headers,
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
      const token = await session?.getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`/api/cart/${product.cartId}`, {
        method: 'DELETE',
        headers,
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
