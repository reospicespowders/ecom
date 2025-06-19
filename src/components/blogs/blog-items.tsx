"use client";
import React, { useEffect, useState } from "react";
import blog_data from "@/data/blog-data";
import { Swiper, SwiperSlide } from "swiper/react";
import BlogSingle from "./single/blog-single";
import Link from "next/link";
import { getLatestBlogsForHome } from "@/lib/sanity.fetch";
import { IBlogData } from "@/types/blog-d-t";

// slider setting
const slider_setting = {
  slidesPerView: 4,
  spaceBetween: 20,
  autoplay: {
    delay: 5000,
    disableOnInteraction: true,
  },
  breakpoints: {
    "1200": {
      slidesPerView: 4,
    },
    "992": {
      slidesPerView: 3,
    },
    "768": {
      slidesPerView: 2,
    },
    "576": {
      slidesPerView: 2,
    },
    "0": {
      slidesPerView: 1,
    },
  },
};

// prop type
type IProps = {
  style_2?: boolean;
  bottom_show?: boolean;
  spacing?: string;
};

const BlogItems = ({style_2=false,bottom_show=true,spacing}: IProps) => {
  const [blogs, setBlogs] = useState<IBlogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      const sanityBlogs = await getLatestBlogsForHome(4);
      // Map Sanity blogs to IBlogData
      const mapped = sanityBlogs.map((blog: any, idx: number) => ({
        id: idx + 1, // fallback, ideally use a hash or _id
        title: blog.title,
        image: blog.mainImage || "/assets/img/blog/blog-bg-1.jpg", // fallback image
        author: blog.author || "Admin",
        category: blog.category?.title || "General",
        desc: blog.excerpt || "",
        date: blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase().replace(/,/g, ".") : "",
        blog: "home",
      }));
      setBlogs(mapped);
      setLoading(false);
    }
    fetchBlogs();
  }, []);

  return (
    <>
      <section
        className={`blog-area ${spacing?spacing:"pt-100 pb-100 grey-bg"}`}
      >
        <div className="container">
          {!style_2 && (
            <div className="row">
              <div className="col-lg-12 text-center">
                <div className="tpsection mb-35">
                  <h4 className="tpsection__sub-title">~ Read Our Blog ~</h4>
                  <h4 className="tpsection__title">Our Latest Post</h4>
                  <p>
                    The liber tempor cum soluta nobis eleifend option congue
                    doming quod mazim.
                  </p>
                </div>
              </div>
            </div>
          )}
          {style_2 && (
            <div className="row align-items-center">
              <div className="col-md-6 text-center">
                <div className="tpsection mb-15">
                  <h4 className="tpsection__title text-start brand-product-title">
                    Our Latest News
                  </h4>
                </div>
              </div>
              <div className="col-md-6">
                <div className="tpproduct__all-item">
                  <Link href="/blog">
                    View All <i className="icon-chevron-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          )}
          {loading ? (
            <div style={{textAlign: "center", padding: 40}}>Loading blogs...</div>
          ) : (
            <Swiper
              {...slider_setting}
              className="swiper-container tpblog-active"
            >
              {blogs.map((blog, index) => (
                <SwiperSlide key={index}>
                  <BlogSingle blog={blog} bottom_show={bottom_show} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogItems;
