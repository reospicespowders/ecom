export interface ICategoryData {
  _id?: string;
  id: number;
  img: string;
  name: string;
  slug: {
    current: string;
  };
  parent?: string;
  children?: ICategoryData[];
  product_id?: number[];
}