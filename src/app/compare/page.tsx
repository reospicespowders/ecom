import { Metadata } from "next";
import Wrapper from "@/layouts/wrapper";
import Header from "@/layouts/header/header";
import FeatureArea from "@/components/feature/feature-area";
import Footer from "@/layouts/footer/footer";
import BreadcrumbTwo from "@/components/breadcrumb/breadcrumb-2";
import CompareArea from "@/components/compare/compare-area";

export const metadata: Metadata = {
  title: "Compare - REO spices and powders",
};

export default function ComparePage() {
  return (
    <Wrapper>
      {/* header start */}
      <Header />
      {/* header end */}

      <main>
        {/* breadcrumb-area-start */}
        <BreadcrumbTwo title="Compare" />
        {/* breadcrumb-area-end */}

        {/* compare area start */}
        <CompareArea />
        {/* compare area end */}

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
