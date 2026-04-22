export interface Product {
  _id: string;
  name: string;
  price: string;
  image: string;
  weight?: string;
  purity?: string;
  makingCharges?: string;

  metal?: string; // ✅ ADD THIS LINE
}