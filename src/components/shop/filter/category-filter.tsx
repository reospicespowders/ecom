'use client';
import React, { useEffect, useState } from "react";
import { fetchCategories } from "@/lib/sanity.fetch";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { add_category, add_sub_category } from "@/redux/features/filter";

const CategoryFilter = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const {category:parentCategory,subCategory} = useAppSelector((state) => state.filter);
  const dispatch = useAppDispatch()

  const handleParentCategory = (value:string) => {
    dispatch(add_category(value))
  };

  const handleSubCategory = (list:string) => {
    dispatch(add_sub_category(list))
  };

  return (
    <div className="tpshop__widget mb-30 pb-25">
      <h4 className="tpshop__widget-title">Product Categories</h4>
      {categories.map((category,i) => (
        <div key={category.id} className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id={`flexCheckDefault-${i+1}`}
            onChange={() => handleParentCategory(category.parent ? category.parent.name : category.name)}
            checked={category.parent ? category.parent.name === parentCategory : category.name === parentCategory}
          />
          <label className="form-check-label" htmlFor={`flexCheckDefault-${i+1}`}>
            {category.parent ? category.parent.name : category.name} ({category.product_id ? category.product_id.length : 0})
          </label>
        </div>
      ))}
    </div>
  );
};

export default CategoryFilter;
