import { Metadata } from "next";
import Wrapper from "@/layouts/wrapper";
import Header from "@/layouts/header/header";
import Footer from "@/layouts/footer/footer";
import BreadcrumbTwo from "@/components/breadcrumb/breadcrumb-2";
import WishlistArea from "@/components/wishlist/wishlist-area";
import { auth } from "@clerk/nextjs/server";
import { getProductById } from "@/lib/sanity.fetch";
import { createClient } from "@/utils/supabase/server";
import Breadcrumb from "@/components/breadcrumb/breadcrumb-area";

export const metadata: Metadata = {
  title: "Wishlist - REO spices and powders",
};

export default async function WishlistPage() {
  const { userId } = await auth();

  let initialWishlistItems = [];

  if (userId) {
    const supabase = createClient();
    const { data: wishlistItems, error } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', userId);

    if (wishlistItems) {
      const detailedItems = await Promise.all(
        wishlistItems.map(async (item) => {
          const productDetails = await getProductById(item.product_id);
          return productDetails ? { ...productDetails, cartId: item.id } : null;
        })
      );
      initialWishlistItems = detailedItems.filter(p => p);
    }
  }

  return (
    <Wrapper>
      <Header />
      <main>
        <Breadcrumb title="Wishlist" subtitle="Wishlist" />
        <WishlistArea initialWishlistItems={initialWishlistItems} />
      </main>
      <Footer />
    </Wrapper>
  );
}
