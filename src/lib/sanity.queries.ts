import { groq } from 'next-sanity';

export const productsQuery = groq`*[_type == "product"]{
  _id,
  id,
  sku,
  title,
  price,
  sale_price,
  "image": image.asset->url,
  "gallery": gallery[].asset->url,
  category->{
    _id,
    id,
    name,
    slug,
    parent->{id, name},
    children[]->{id, name},
    product_id
  },
  brand,
  quantity,
  unit,
  description,
  videoId,
  orderQuantity,
  productInfoList,
  additionalInfo,
  reviews,
  tags,
  status,
  sold,
  created_at,
  updated_at,
  color,
  offerDate
}`;

export const categoriesQuery = groq`*[_type == "category"]{
  _id,
  id,
  name,
  slug,
  "img": img.asset->url,
  "banner": banner.asset->url,
  parent->{id, name},
  children[]->{id, name},
  product_id
}`; 