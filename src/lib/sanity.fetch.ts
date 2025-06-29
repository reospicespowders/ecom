import { getSafeClient } from './sanity.client';
import { categoriesQuery } from './sanity.queries';

export async function fetchCategories() {
  try {
    const safeClient = getSafeClient();
    return await safeClient.fetch(categoriesQuery);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getProducts() {
  try {
    const safeClient = getSafeClient();
    
    const query = `*[_type == "product"] {
      _id,
      id,
      sku,
      title,
      price,
      sale_price,
      "image": image.asset->url,
      category->{
        _id,
        id,
        name,
        slug
      },
      quantity,
      unit,
      "gallery": gallery[].asset->url,
      description,
      videoId,
      orderQuantity,
      productInfoList,
      additionalInfo,
      reviews,
      tags,
      status,
      brand,
      sold,
      created_at,
      updated_at,
      color,
      offerDate,
      "slug": slug.current,
      "reviews": reviews[]->{
        _id,
        reviewerName,
        reviewerEmail,
        comment,
        rating,
        approved,
        _createdAt
      }[approved == true]
    }`;

    return safeClient.fetch(query);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const safeClient = getSafeClient();
    
    const query = `*[_type == "product" && slug.current == $slug][0] {
      _id,
      id,
      sku,
      title,
      price,
      sale_price,
      "image": image.asset->url,
      category->{
        _id,
        id,
        name,
        slug
      },
      quantity,
      unit,
      "gallery": gallery[].asset->url,
      description,
      videoId,
      orderQuantity,
      productInfoList,
      additionalInfo,
      reviews,
      tags,
      status,
      brand,
      sold,
      created_at,
      updated_at,
      color,
      offerDate,
      "slug": slug.current,
      "reviews": reviews[]->{
        _id,
        reviewerName,
        reviewerEmail,
        comment,
        rating,
        approved,
        _createdAt
      }[approved == true]
    }`;

    return safeClient.fetch(query, { slug });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
}

export async function getProductById(id: string) {
  try {
    const safeClient = getSafeClient();
    
    const query = `*[_type == "product" && _id == $id][0] {
      _id,
      id,
      sku,
      title,
      price,
      sale_price,
      "image": image.asset->url,
      category->{
        _id,
        id,
        name,
        slug
      },
      quantity,
      unit,
      "gallery": gallery[].asset->url,
      description,
      videoId,
      orderQuantity,
      productInfoList,
      additionalInfo,
      reviews,
      tags,
      status,
      brand,
      sold,
      created_at,
      updated_at,
      color,
      offerDate,
      "slug": slug.current,
      "reviews": reviews[]->{
        _id,
        reviewerName,
        reviewerEmail,
        comment,
        rating,
        approved,
        _createdAt
      }[approved == true]
    }`;

    return safeClient.fetch(query, { id });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
}

export async function getProductsByCategory(categorySlug: string) {
  try {
    const safeClient = getSafeClient();
    
    const query = `*[_type == "product" && category->slug.current == $categorySlug] {
      _id,
      id,
      sku,
      title,
      price,
      sale_price,
      "image": image.asset->url,
      category->{
        _id,
        id,
        name,
        slug
      },
      quantity,
      unit,
      "gallery": gallery[].asset->url,
      description,
      videoId,
      orderQuantity,
      productInfoList,
      additionalInfo,
      reviews,
      tags,
      status,
      brand,
      sold,
      created_at,
      updated_at,
      color,
      offerDate,
      "slug": slug.current,
      "reviews": reviews[]->{
        _id,
        reviewerName,
        reviewerEmail,
        comment,
        rating,
        approved,
        _createdAt
      }[approved == true]
    }`;

    return safeClient.fetch(query, { categorySlug });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

export async function getProductsByBrand(brandName: string) {
  try {
    const safeClient = getSafeClient();
    
    const query = `*[_type == "product" && brand match $brandName] {
      _id,
      id,
      sku,
      title,
      price,
      sale_price,
      "image": image.asset->url,
      category->{
        _id,
        id,
        name,
        "slug": slug.current
      },
      quantity,
      unit,
      "gallery": gallery[].asset->url,
      description,
      videoId,
      orderQuantity,
      productInfoList,
      additionalInfo,
      reviews,
      tags,
      status,
      brand,
      sold,
      created_at,
      updated_at,
      color,
      offerDate,
      "slug": slug.current,
      "reviews": reviews[]->{
        _id,
        reviewerName,
        reviewerEmail,
        comment,
        rating,
        approved,
        _createdAt
      }[approved == true]
    }`;

    return safeClient.fetch(query, { brandName });
  } catch (error) {
    console.error('Error fetching products by brand:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    const safeClient = getSafeClient();
    
    const query = `*[_type == "category"] {
      _id,
      id,
      name,
      "img": img.asset->url,
      slug,
      parent,
      children[]->{
        _id,
        id,
        name,
        "img": img.asset->url,
        slug
      },
      product_id
    }`;

    return safeClient.fetch(query);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function submitReview(reviewData: {
  reviewerName: string;
  reviewerEmail: string;
  comment: string;
  rating: number;
  productId: string;
}) {
  try {
    const safeClient = getSafeClient();
    const { reviewerName, reviewerEmail, comment, rating, productId } = reviewData;

    const newReview = {
      _type: 'review',
      reviewerName,
      reviewerEmail,
      comment,
      rating,
      product: {
        _ref: productId,
        _type: 'reference',
      },
      approved: false, // Reviews will be pending approval by default
    };

    const createdReview = await safeClient.create(newReview);

    // Patch the product to add a reference to the new review
    await safeClient
      .patch(productId)
      .setIfMissing({ reviews: [] })
      .append('reviews', [createdReview._id])
      .commit();

    return createdReview;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
}

export async function getBlogByCategoryAndSlug(categorySlug: string, blogSlug: string) {
  try {
    const safeClient = getSafeClient();
    
    const query = `*[_type == "blog" && slug.current == $blogSlug && category->slug.current == $categorySlug][0]{
      _id,
      title,
      slug,
      excerpt,
      content,
      "mainImage": mainImage.asset->url,
      author,
      publishedAt,
      category->{_id, title, slug}
    }`;
    return safeClient.fetch(query, { blogSlug, categorySlug });
  } catch (error) {
    console.error('Error fetching blog by category and slug:', error);
    return null;
  }
}

export async function getLatestBlogsForHome(limit = 4) {
  try {
    const safeClient = getSafeClient();
    
    const query = `*[_type == "blog"] | order(publishedAt desc)[0...$limit]{
      _id,
      title,
      slug,
      excerpt,
      content,
      "mainImage": mainImage.asset->url,
      author,
      publishedAt,
      category->{title, slug}
    }`;
    return safeClient.fetch(query, { limit });
  } catch (error) {
    console.error('Error fetching latest blogs:', error);
    return [];
  }
} 