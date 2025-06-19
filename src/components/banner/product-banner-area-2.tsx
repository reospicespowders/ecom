import Link from 'next/link';
import React from 'react';

// banner item 
function BannerItem ({bg,subtitle,title,text}:{bg:string;subtitle:string;title:string;text:string}) {
  return (
    <div className="col-lg-4 col-md-6">
      <div className="tpbanner__item mb-30">
          <Link href="/shop">
            <div className="tpbanner__text tpbanner__bg" style={{backgroundImage: `url(${bg})`}}>
                <span className="tpbanner__sub-title mb-20">{subtitle}</span>
                <h4 className="tpbanner__title mb-20" dangerouslySetInnerHTML={{ __html: title }}></h4>
                <p>{text}</p>
            </div>
          </Link>
      </div>
    </div>
  )
}

const ProductBannerAreaTwo = () => {
  return (
   <section className="banner-area grey-bg">
      <div className="container">
          <div className="sections__wrapper white-bg pt-20 pl-50 pr-50 pb-30">
            <div className="row">
              <BannerItem bg="/assets/img/banner/spices-banner-1.jpg" subtitle="Top offers" title="Organic Spices <br/> Straight from Nature"  text="Pure taste, rich aroma, zero additives" />
              <BannerItem bg="/assets/img/banner/spices-banner-2.jpg" subtitle="Weekend Deals" title="Traditional Herbs <br/> Wellness in Every Spoon" text="Ancient remedies made fresh for today" />
              <BannerItem bg="/assets/img/banner/spices-banner-3.jpg" subtitle="Top seller" title="Best-Selling Blends <br/> Taste the Purity" text="Handpicked spices for mindful living" />
            </div>
          </div>
      </div>
    </section>
  );
};

export default ProductBannerAreaTwo;