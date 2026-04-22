import type { Product } from "../types/Product";

export const calculatePriceBreakdown = (product: Product, goldRates: any) => {
  if (!product) return null;

  const weight = parseFloat(product.weight || "0");
  const making = parseFloat(product.makingCharges || "0");
  const purity = product.purity || "22K";

  const rate = goldRates[purity] || 0;

  const goldPrice = weight * rate;
  
  const goldGST = goldPrice * 0.03; // Standard 3% GST on Gold
  const makingGST = making * 0.05; // Standard 5% GST on Making Charges
  const totalGST = goldGST + makingGST;

  const final = goldPrice + making + totalGST;

  return {
    goldPrice,
    making,
    goldGST,
    makingGST,
    totalGST,
    final
  };
};

export const calculateFinalPrice = (product: Product, goldRates: any): string => {
  const breakdown = calculatePriceBreakdown(product, goldRates);
  return breakdown ? breakdown.final.toFixed(2) : "0.00";
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
