import { client } from './sanity.client';
import { categoriesQuery } from './sanity.queries';

export async function fetchCategories() {
  return await client.fetch(categoriesQuery);
}

export async function getProducts() {
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
    "slug": slug.current
  }`;

  return client.fetch(query);
}

export async function getProductBySlug(slug: string) {
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
    "slug": slug.current
  }`;

  return client.fetch(query, { slug });
}

export async function getProductsByCategory(categorySlug: string) {
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
    "slug": slug.current
  }`;

  return client.fetch(query, { categorySlug });
}

export async function getProductsByBrand(brandName: string) {
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
    "slug": slug.current
  }`;

  return client.fetch(query, { brandName });
}

export async function getCategories() {
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

  return client.fetch(query);
} 