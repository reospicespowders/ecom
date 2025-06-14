'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ICategoryData } from '@/types/category-d-t';
import { getCategories } from '@/lib/sanity.fetch';

const HeaderNav = () => {
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
    <nav className="main-menu d-none d-lg-block">
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/shop">Shop</Link>
          <ul className="sub-menu">
            {categories.map((category) => (
              <li key={category._id}>
                <Link href={`/shop?category=${category.slug.current}`}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  );
};

export default HeaderNav; 