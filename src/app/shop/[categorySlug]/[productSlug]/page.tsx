import { getProductBySlug, getProductsByCategory } from "@/lib/sanity.fetch";
import ShopDetailsArea from "@/components/shop-details/shop-details-area";
import { notFound } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import Header from "@/layouts/header/header";
import Footer from "@/layouts/footer/footer";
import Wrapper from "@/layouts/wrapper";
import { Metadata } from "next";
import Breadcrumb from '@/components/breadcrumb/breadcrumb-area';

interface Props {
  params: {
    categorySlug: string;
    productSlug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.productSlug);
  if (!product) {
    return {};
  }
  return {
    title: product.title,
  };
}

// Revalidate the page every 30 seconds
export const revalidate = 30;

export default async function ProductDetailsPage({ params }: Props) {
  const { categorySlug, productSlug } = params;
  const product = await getProductBySlug(productSlug);

  if (!product) {
    notFound();
  }

  const relatedProducts = product.category?.slug?.current 
    ? await getProductsByCategory(product.category.slug.current)
    : [];

  const filteredRelatedProducts = relatedProducts.filter((p: any) => p._id !== product._id);

  async function revalidateProductPage(category: string, slug: string) {
    'use server';
    revalidateTag(`product:${category}:${slug}`);
  }

  return (
    <Wrapper>
      <Header />
      <main>
        <Breadcrumb title="Shop Details" subtitle="Shop Details" />
        <ShopDetailsArea 
          product={product} 
          relatedProducts={filteredRelatedProducts}
          revalidate={revalidateProductPage} 
        />
      </main>
      <Footer />
    </Wrapper>
  );
} 