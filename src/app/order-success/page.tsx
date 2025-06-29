'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Wrapper from "@/layouts/wrapper";
import Header from "@/layouts/header/header";
import Footer from "@/layouts/footer/footer";

const OrderSuccessPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams!.get('orderId');
  const orderNumber = searchParams!.get('orderNumber');

  return (
    <Wrapper>
      <Header />
      <main>
        <div className="container text-center pt-100 pb-100">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Successful!</h2>
              <p className="text-gray-600">Thank you for your purchase. We&apos;ll send you a confirmation email shortly.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
              <div className="space-y-2 text-left">
                {orderNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">{orderNumber}</span>
                  </div>
                )}
                {orderId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono text-sm">{orderId}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <Link href="/shop" className="tp-btn-2 inline-block">
            Continue Shopping
          </Link>
              <div className="text-sm text-gray-500">
                <p>Need help? Contact us at support@example.com</p>
              </div>
            </div>
          </div>
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