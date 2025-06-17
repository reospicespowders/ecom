import React from 'react';
import { SignIn, SignUp } from "@clerk/nextjs";

const LoginArea = () => {
  return (
    <section className="track-area pb-40">
    <div className="container">
       <div className="row justify-content-center">
          {/* Sign In */}
          <div className="col-lg-6 col-sm-12">
             <div className="tptrack__product mb-40">
                <div className="tptrack__content grey-bg">
                   <div className="tptrack__item d-flex mb-20">
                      <div className="tptrack__item-icon">
                         <i className="fal fa-user-unlock"></i>
                      </div>
                      <div className="tptrack__item-content">
                         <h4 className="tptrack__item-title">Login Here</h4>
                         <p>Your personal data will be used to support your experience throughout this website, to manage access to your account.</p>
                      </div>
                   </div>
                <SignIn 
                  appearance={{
                    elements: {
                      formButtonPrimary: 'tptrack__submition active',
                      card: 'bg-transparent shadow-none',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      socialButtonsBlockButton: 'tptrack__submition',
                      formFieldInput: 'tpsign__input',
                      formFieldLabel: 'text-sm font-medium text-gray-700',
                      formFieldAction: 'text-sm text-primary hover:text-primary/90',
                      footerAction: 'text-sm text-gray-600',
                      footerActionLink: 'text-primary hover:text-primary/90',
                    },
                  }}
                />
                </div>
             </div>
          </div>
          
          {/* Sign Up */}
          <div className="col-lg-6 col-sm-12">
             <div className="tptrack__product mb-40">
                <div className="tptrack__content grey-bg">
                   <div className="tptrack__item d-flex mb-20">
                      <div className="tptrack__item-icon">
                         <i className="fal fa-lock"></i>
                      </div>
                      <div className="tptrack__item-content">
                         <h4 className="tptrack__item-title">Sign Up</h4>
                         <p>Your personal data will be used to support your experience throughout this website, to manage access to your account.</p>
                      </div>
                   </div>
                <SignUp 
                  appearance={{
                    elements: {
                      formButtonPrimary: 'tptrack__submition active',
                      card: 'bg-transparent shadow-none',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      socialButtonsBlockButton: 'tptrack__submition',
                      formFieldInput: 'tpsign__input',
                      formFieldLabel: 'text-sm font-medium text-gray-700',
                      formFieldAction: 'text-sm text-primary hover:text-primary/90',
                      footerAction: 'text-sm text-gray-600',
                      footerActionLink: 'text-primary hover:text-primary/90',
                    },
                  }}
                />
                </div>
             </div>
          </div>
       </div>
    </div>
 </section>
  );
};

export default LoginArea;