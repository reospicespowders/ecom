'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { IProductData } from '@/types/product-d-t';
import { FourColDots, ListDots, ThreeColDots } from '../svg';
import usePagination from '@/hooks/use-pagination';
import CategoryArea from '../category/category-area';
import NiceSelect from '../ui/nice-select';
import ShopItems from '../shop/shop-items';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "../ui/pagination";

// tabs
const col_tabs = [
  { title: "four-col", icon: <FourColDots /> },
  { title: "three-col", icon: <ThreeColDots /> },
  { title: "list", icon: <ListDots /> },
];


const SearchArea = ({ allProducts }: { allProducts: IProductData[] }) => {
  const [productItems, setProductItems] = useState<IProductData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(col_tabs[0].title);
  const pagination_per_page = activeTab === "four-col" ? 12 : 9;
  const {currentItems,handlePageClick,pageCount} = usePagination<IProductData>(productItems, pagination_per_page);

  // handle active tab
  function handleActiveTab(tab: string) {
    setActiveTab(tab);
  }
  const searchParams = useSearchParams();
  const searchText = searchParams?.get("searchText") ?? "";

  const titleMatch = (item: IProductData) => {
    return (
      !searchText || item.title.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  useEffect(() => {
    setProductItems(allProducts.filter(item => titleMatch(item)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, allProducts]);

  const handleSorting = (item: { value: string; label: string }) => {
    if (item.value === "new") {
      setProductItems([...productItems].slice().reverse());
    } else if (item.value === "high") {
      setProductItems([...productItems].sort((a, b) => b.price - a.price));
    } else if (item.value === "low") {
      setProductItems([...productItems].sort((a, b) => a.price - b.price));
    } else {
      setProductItems([...productItems]);
    }
  };

  return (
   <section className="shop-area-start grey-bg pb-200">
      <div className="container">
        <div className="row">
          <div className="col-xl-12 col-lg-12 col-md-12">
            <div className="tpshop__details">
              <div className="tpshop__category">
                <CategoryArea cls="inner-category-two" showCount={false} />
              </div>
              <div className="product__filter-content mb-30">
                <div className="row align-items-center">
                  <div className="col-sm-4">
                    <div className="product__item-count">
                      <span>Showing 1 -{currentItems.length} of {productItems.length}{" "} Products</span>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="tpproductnav tpnavbar product-filter-nav d-flex align-items-center justify-content-center">
                      <nav>
                        <div className="nav nav-tabs">
                          {col_tabs.map((tab, index) => (
                            <button
                              key={index}
                              className={`nav-link ${activeTab === tab.title ? "active" : ""}`}
                              onClick={() => handleActiveTab(tab.title)}
                            >
                              <i>{tab.icon}</i>
                            </button>
                          ))}
                        </div>
                      </nav>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="product__navtabs d-flex justify-content-end align-items-center">
                      <div className="tp-shop-selector">
                        <NiceSelect
                          options={[
                            { value: "", label: "Default sorting" },
                            { value: "new", label: "New Arrivals" },
                            { value: "high", label: "Price High To Low" },
                            { value: "low", label: "Price Low To High" },
                          ]}
                          defaultCurrent={0}
                          onChange={(item) => handleSorting(item)}
                          name="Sorting"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* shop items start */}
              <ShopItems
                products={currentItems}
                activeTab={activeTab}
                currentItems={currentItems}
              />
              {/* shop items end */}
              <div className="basic-pagination text-center mt-35">
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
      </div>
    </section>
  );
};

export default SearchArea;