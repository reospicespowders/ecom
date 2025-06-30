import { getBlogByCategoryAndSlug } from '@/lib/sanity.fetch';
import { PortableText } from '@portabletext/react';
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: {
    category: string;
    'blog-slug': string;
  };
}

export default async function BlogPage({ params }: PageProps) {
  const { category, 'blog-slug': blogSlug } = params;
  const blog = await getBlogByCategoryAndSlug(category, blogSlug);

  if (!blog) return <div>Blog not found</div>;

  return (
    <div className="blog-details-container">
      <h1>{blog.title}</h1>
      <div className="postbox__thumb-3 w-img">
        <Link href="/blog-details">
          <Image src={blog.mainImage} alt={blog.title} width={800} height={400} />
        </Link>
      </div>
      <div style={{ margin: '24px 0' }}>
        <PortableText value={blog.content} />
      </div>
    </div>
  );
} 