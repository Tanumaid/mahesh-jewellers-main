import type { Product } from "../types/Product";

export const calculatePriceBreakdown = (
  product: Product,
  goldRates: any,
  silverRates: any
) => {
  if (!product) return null;

  const weight = parseFloat(product.weight || "0");
  const making = parseFloat(product.makingCharges || "0");
  const purity = product.purity || "";
  const metal = product.metal || "Gold";

  let basePrice = 0;

  // ✅ GOLD CALCULATION
  if (metal === "Gold") {
    const rate = goldRates[purity] || 0;
    basePrice = weight * rate;
  }

  // ✅ SILVER CALCULATION
  else if (metal === "Silver") {
    const rate = silverRates[purity] || 0;
    basePrice = weight * rate;
  }

  // ✅ GST CALCULATION
  const metalGST = basePrice * 0.03; // 3% GST
  const makingGST = making * 0.05;   // 5% GST
  const totalGST = metalGST + makingGST;

  const final = basePrice + making + totalGST;

  return {
    basePrice,
    making,
    metalGST,
    makingGST,
    totalGST,
    final
  };
};

// ✅ FINAL PRICE FUNCTION (UPDATED)
export const calculateFinalPrice = (
  product: Product,
  goldRates: any,
  silverRates: any
): string => {
  const breakdown = calculatePriceBreakdown(product, goldRates, silverRates);
  return breakdown ? breakdown.final.toFixed(2) : "0.00";
};

// ✅ FORMAT PRICE (NO CHANGE)
export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0.00";

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(numPrice);
};