export interface Product {
  _id: string;
  name: string;
  price: string;
  image: string;
  weight?: string;
  purity?: string;
  makingCharges?: string;
  gst?: string;
  category?: string;
  subcategory?: string;
  quantity?: number;
  stockStatus?: string;
  soldCount?: number;
  lowStock?: boolean;
}