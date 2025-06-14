import { getProductBySlug } from '@/lib/sanity.fetch';
import ShopDetailsArea from '@/components/shop-details/shop-details-area';
import { notFound } from 'next/navigation';
import Header from "@/layouts/header/header";
import Footer from "@/layouts/footer/footer";

interface Props {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <main>
      <Header />
      <ShopDetailsArea product={product} />
      <Footer />
    </main>
  );
} 