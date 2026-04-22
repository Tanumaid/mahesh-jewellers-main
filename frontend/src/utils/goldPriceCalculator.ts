import type { Product } from "../types/Product";

export const calculateGoldPriceBreakdown = (
  product: Product,
  goldRates: any
) => {
  if (!product) return null;

  const weight = parseFloat(product.weight || "0");
  const making = parseFloat(product.makingCharges || "0");
  const purity = product.purity || "22K";

  const rate = goldRates[purity] || 0;

  const goldPrice = weight * rate;

  const goldGST = goldPrice * 0.03; // 3% GST
  const makingGST = making * 0.05;  // 5% GST
  const totalGST = goldGST + makingGST;

  const final = goldPrice + making + totalGST;

  return {
    basePrice: goldPrice,
    making,
    goldGST,
    makingGST,
    totalGST,
    final
  };
};

export const calculateGoldFinalPrice = (
  product: Product,
  goldRates: any
): string => {
  const breakdown = calculateGoldPriceBreakdown(product, goldRates);
  return breakdown ? breakdown.final.toFixed(2) : "0.00";
};