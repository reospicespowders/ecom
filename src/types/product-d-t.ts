export type IReview = {
  _id: string;
  reviewerName: string;
  reviewerEmail?: string;
  comment: string;
  rating: number;
  approved: boolean;
  _createdAt: string;
}

export interface IProductData {
  _id: string;
  id: number;
  sku: string;
  title: string;
  price: number;
  sale_price?: number;
  image: string;
  category: {
    _id: string;
    id: number;
    name: string;
    slug: {
      current: string;
  };
  };
  quantity: number;
  unit: string;
  gallery: string[];
  description: any;
  videoId?: string;
  orderQuantity?: number;
  productInfoList: Array<{ title: string; value: string }>;
  additionalInfo: any;
  reviews: IReview[];
  tags: string[];
  status: string;
  brand: string;
  sold: number;
  created_at: string;
  updated_at: string;
  color?: string[];
  offerDate?: {
    start: string;
    end: string;
  };
  slug: string;
}