'use client';

import { IProductData } from "@/types/product-d-t";
import Image from "next/image";
import { useState } from "react";
import { useSession } from '@clerk/nextjs';
import { handleAddToCart } from '@/utils/cart';

const ProductDetails = ({ product }: { product: IProductData }) => {
    const { session } = useSession();
    const [quantity, setQuantity] = useState(1);
    return (
        <section className="product-details-area pt-120 pb-120">
            <div className="container">
                <div className="row">
                    <div className="col-lg-6">
                        <div className="product-details-img">
                            <Image src={product.image} alt={product.title} width={600} height={600} />
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="product-details-content">
                            <h2>{product.title}</h2>
                            <div className="product-details-price">
                                <span>${product.price}</span>
                                {product.sale_price && <span className="old-price">${product.sale_price}</span>}
                            </div>
                            <p>{product.description}</p>
                            <div className="product-details-action">
                                <div className="cart-plus-minus">
                                    <input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} min="1"/>
                                </div>
                                <button onClick={() => handleAddToCart(product._id, quantity, () => session?.getToken() ?? Promise.resolve(null))} className="cart-btn">Add to cart</button>
                                <a href="#" className="action-btn"><i className="fas fa-heart"></i></a>
                                <a href="#" className="action-btn"><i className="fas fa-layer-group"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductDetails; 