"use client";
import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import BackToTop from '@/components/common/back-to-top';

const Wrapper = ({children}:{children:React.ReactNode}) => {
  useEffect(() => {
    // any initialization logic can go here
  },[])
  return (
    <>
      {children}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <BackToTop/>
    </>
  );
};

export default Wrapper;
