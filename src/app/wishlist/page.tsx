import { Metadata } from "next";
import Wrapper from "@/layouts/wrapper";
import Header from "@/layouts/header/header";
import Footer from "@/layouts/footer/footer";
import BreadcrumbTwo from "@/components/breadcrumb/breadcrumb-2";
import WishlistArea from "@/components/wishlist/wishlist-area";

export const metadata: Metadata = {
  title: "Wishlist - Orfarm",
};

export default function WishlistPage() {
  return (
    <Wrapper>
      <Header />
      <main>
        <BreadcrumbTwo title="Wishlist" />
        <WishlistArea />
      </main>
      <Footer />
    </Wrapper>
  );
}
