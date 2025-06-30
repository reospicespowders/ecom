import { Metadata } from "next";
import Wrapper from "@/layouts/wrapper";
import HeaderTwo from "@/layouts/header/header-2";
import HeroBannerThree from "@/components/hero-banner/hero-banner-3";
import FeatureAreaTwo from "@/components/feature/feature-area-2";
import DiscountProducts from "@/components/product/home-3/discount-products";
import ProductBannerAreaTwo from "@/components/banner/product-banner-area-2";
import TabFilterProducts from "@/components/product/home-3/tab-filter-products";
import TopAllProducts from "@/components/product/home-3/top-all-products";
import ProductBannerAreaThree from "@/components/banner/product-banner-area-3";
import ProductBrandFeature from "@/components/product/feature/product-brand-feature";
import TestimonialArea from "@/components/testimonial/testimonial-area";
import CartArea from "@/components/product/home/cart-area";
import BlogItems from "@/components/blogs/blog-items";
import Footer from "@/layouts/footer/footer";
import InstagramArea from '@/components/instagram/instagram-area';
import { getLatestBlogsForHome, getProductsByBrand, getProducts } from '@/lib/sanity.fetch';

export const metadata: Metadata = {
  title: "Home - REO spices and powders",
};

export default async function HomeThreePage() {
  const latestBlogs = await getLatestBlogsForHome(4);
  const brandProducts = await getProductsByBrand('REO Spices and Powders');
  const allProducts = await getProducts();
  const discountProducts = allProducts.filter((p: any) => p.sale_price);

  return (
    <Wrapper>
      {/* header start */}
      <HeaderTwo />
      {/* header end */}

      <main>
        {/* hero start */}
        <HeroBannerThree />
        {/* hero end */}

        {/* feature area start */}
        <FeatureAreaTwo />
        {/* feature area end */}

        {/* discount product area start */}
        <DiscountProducts discountProducts={discountProducts} />
        {/* discount product area end */}

        {/* product banner area start */}
        <ProductBannerAreaTwo />
        {/* product banner area end */}

        {/* tab filter products start */}
        <TabFilterProducts allProducts={allProducts} />
        {/* tab filter products end */}

        {/* all products start */}
        <TopAllProducts allProducts={allProducts} />
        {/* all products end */}

        {/* product banner area start */}
        <ProductBannerAreaThree />
        {/* product banner area end */}

        {/* product brand feature start */}
        <ProductBrandFeature brandProducts={brandProducts} />
        {/* product brand feature end */}

        {/* testimonial area start */}
        <TestimonialArea />
        {/* testimonial area end */}

        {/* cart area start */}
        <CartArea />
        {/* cart area end */}

        {/* blog area start */}
        <BlogItems blogs={latestBlogs} spacing="pb-20 pt-50" style_2={true} bottom_show={false}/>
        {/* blog area end */}

        {/* instagram area start */}
        <InstagramArea />
        {/* instagram area end */}
      </main>

      {/* footer start */}
      <Footer style_2={true}/>
      {/* footer end */}
    </Wrapper>
  );
}
