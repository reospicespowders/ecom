import { getBlogByCategoryAndSlug } from '@/lib/sanity.fetch';
import { PortableText } from '@portabletext/react';

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
      {blog.mainImage && (
        <img src={blog.mainImage} alt={blog.title} style={{ maxWidth: '100%', borderRadius: 12, margin: '24px 0' }} />
      )}
      <div style={{ margin: '24px 0' }}>
        <PortableText value={blog.content} />
      </div>
    </div>
  );
} 