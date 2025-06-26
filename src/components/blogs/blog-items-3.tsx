'use client'
import React from "react";
import blog_data from "@/data/blog-data";
import BlogSingle from "./single/blog-single";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "../ui/pagination";
import usePagination from "@/hooks/use-pagination";
import { IBlogData } from "@/types/blog-d-t";

const BlogItemsThree = () => {
  const blog_items = [...blog_data];
  const { currentItems, handlePageClick, pageCount } = usePagination<IBlogData>(blog_items,6);
  return (
    <section className="blog-area pt-80">
      <div className="container">
        <div className="row">
          {currentItems.map((blog) => (
            <div className="col-lg-4" key={blog.id}>
              <BlogSingle blog={blog} style_2={true} bottom_show={true} />
            </div>
          ))}
          <div className="col-lg-12">
            <div className="basic-pagination text-center mb-80">
              <nav>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogItemsThree;
