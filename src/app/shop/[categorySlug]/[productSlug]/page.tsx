import { getProductBySlug } from '@/lib/sanity.fetch';
import ShopDetailsArea from '@/components/shop-details/shop-details-area';
import { notFound } from 'next/navigation';
import { revalidateProductPage } from './actions';
import Header from "@/layouts/header/header";
import Footer from "@/layouts/footer/footer";
import { Metadata } from "next";

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

export default async function ProductDetailsPage({ params }: Props) {
  const product = await getProductBySlug(params.productSlug);

  if (!product) {
    notFound();
  }

  return (
    <main>
      <Header />
      <ShopDetailsArea product={product} revalidate={revalidateProductPage} />
      <Footer />
    </main>
  );
} 