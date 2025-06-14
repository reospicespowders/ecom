import { Metadata } from "next";
import Wrapper from "@/layouts/wrapper";
import Header from "@/layouts/header/header";
import FeatureArea from "@/components/feature/feature-area";
import BreadcrumbTwo from "@/components/breadcrumb/breadcrumb-2";
import Footer from "@/layouts/footer/footer";
import ShopArea from "@/components/shop/shop-area";
import { Suspense } from "react";

type CategoryPageProps = {
  params: { categorySlug: string };
};

export const metadata: Metadata = {
  title: "Category Shop - Orfarm",
};

export default function CategoryShopPage({ params }: CategoryPageProps) {
  const { categorySlug } = params;

  return (
    <Wrapper>
      {/* header start */}
      <Header />
      {/* header end */}

      <main>
        {/* breadcrumb-area-start */}
        <BreadcrumbTwo title={categorySlug.replace(/-/g, ' ')} bgClr="grey-bg" />
        {/* breadcrumb-area-end */}

        {/* shop area start */}
        <Suspense fallback={<div>Loading shop...</div>}>
          <ShopArea categorySlug={categorySlug} />
        </Suspense>
        {/* shop area end */}

        {/* feature area start */}
        <FeatureArea style_2={true} />
        {/* feature area end */}
      </main>

      {/* footer start */}
      <Footer />
      {/* footer end */}
    </Wrapper>
  );
} 