import { Metadata } from "next";
import Wrapper from "@/layouts/wrapper";
import Header from "@/layouts/header/header";
import FeatureArea from "@/components/feature/feature-area";
import BreadcrumbTwo from "@/components/breadcrumb/breadcrumb-2";
import SearchArea from "@/components/search/search-area";
import Footer from "@/layouts/footer/footer";
import { Suspense } from "react";
import { getProducts } from '@/lib/sanity.fetch';
import Breadcrumb from '@/components/breadcrumb/breadcrumb-area';

export const metadata: Metadata = {
  title: "Search - REO spices and powders",
};

export default async function SearchPage() {
  const allProducts = await getProducts();

  return (
    <Wrapper>
      {/* header start */}
      <Header />
      {/* header end */}

      <main>
        {/* breadcrumb-area-start */}
        <Breadcrumb title="Search" subtitle="Search" />
        {/* breadcrumb-area-end */}

        {/* search area start */}
        <Suspense fallback={<div>Loading search...</div>}>
          <SearchArea allProducts={allProducts} />
        </Suspense>
        {/* search area end */}

        {/* feature area start */}
        <FeatureArea />
        {/* feature area end */}
      </main>

      {/* footer start */}
      <Footer />
      {/* footer end */}
    </Wrapper>
  );
}
