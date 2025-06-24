'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Wrapper from "@/layouts/wrapper";
import Header from "@/layouts/header/header";
import Footer from "@/layouts/footer/footer";

const OrderSuccessPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <Wrapper>
      <Header />
      <main>
        <div className="container text-center pt-100 pb-100">
          <h2>Order Successful!</h2>
          <p>Thank you for your purchase.</p>
          {orderId && <p>Your Order ID is: <strong>{orderId}</strong></p>}
          <Link href="/shop" className="tp-btn-2 mt-20">
            Continue Shopping
          </Link>
        </div>
      </main>
      <Footer />
    </Wrapper>
  );
};

export default function OrderSuccess() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <OrderSuccessPage />
        </React.Suspense>
    )
} 