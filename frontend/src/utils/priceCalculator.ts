import type { Product } from "../types/Product";
import { calculateGoldPriceBreakdown, calculateGoldFinalPrice } from "./goldPriceCalculator";
import { calculateSilverPriceBreakdown, calculateSilverFinalPrice } from "./silverPriceCalculator";

export const calculateFinalPrice = (product: Product, goldRates: any, silverRates: any): string => {
  if (!product) return "0.00";

  const metalType =
    product.metal?.toLowerCase() ||
    (product.purity?.toLowerCase().includes("silver") ? "silver" : "gold");

  if (metalType === "silver") {
    return calculateSilverFinalPrice(product, silverRates);
  } else {
    return calculateGoldFinalPrice(product, goldRates);
  }
};

export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0.00";
  
  // Indian number format (e.g., 25,000)
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(numPrice);
};
