'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ICategoryData } from '@/types/category-d-t';
import { getCategories } from '@/lib/sanity.fetch';

const FooterCategory = () => {
  const [categories, setCategories] = useState<ICategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="footer-widget">
      <h4 className="footer-widget-title">Product Categories</h4>
      <ul className="footer-widget-list">
        {categories.map((category) => (
          <li key={category._id}>
            <Link href={`/shop?category=${category.slug.current}`}>
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterCategory; 