'use client';

import { IProductData } from "@/types/product-d-t";
import Image from "next/image";
import Link from "next/link";
import { useSession } from '@clerk/nextjs';
import { handleAddToCart } from '@/utils/cart';

const ProductSingle = ({product}:{product:IProductData}) => {
    const { session } = useSession();
    return (
        <div className="product__item-3 mb-20">
            <div className="product__thumb-3 fix w-img">
                <Link href={`/shop/${product.slug}`}>
                    <Image src={product.image} alt="product" width={300} height={300} />
                </Link>
                <div className="product__action-3">
                    <button className="icon-box icon-box-1" onClick={() => handleAddToCart(product._id, 1, () => session?.getToken() ?? Promise.resolve(null))}>
                        <i className="fal fa-shopping-cart"></i>
                        <i className="fal fa-shopping-cart"></i>
                    </button>
                    <a href="#" className="icon-box icon-box-1" data-bs-toggle="modal" data-bs-target="#productModalId">
                        <i className="fal fa-eye"></i>
                        <i className="fal fa-eye"></i>
                    </a>
                    <a href="#" className="icon-box icon-box-1">
                        <i className="fal fa-heart"></i>
                        <i className="fal fa-heart"></i>
                    </a>
                </div>
            </div>
            <div className="product__content-3">
                <div className="product__category-3">
                    <span>{product.category.name}</span>
                </div>
                <h6><Link href={`/shop/${product.slug}`}>{product.title}</Link></h6>
                <div className="price-3">
                    <span>${product.price}</span>
                    {product.sale_price && <span className="old-price">${product.sale_price}</span>}
                </div>
            </div>
        </div>
    );
};

export default ProductSingle; 