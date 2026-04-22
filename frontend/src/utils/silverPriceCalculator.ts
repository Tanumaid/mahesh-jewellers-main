import type { Product } from "../types/Product";

export const calculateSilverPriceBreakdown = (
  product: Product,
  silverRates: any
) => {
  if (!product) return null;

  const weight = parseFloat(product.weight || "0");
  const making = parseFloat(product.makingCharges || "0");

  // ✅ FIX 1: Safe purity extraction
  const rawPurity = product.purity || "";
  const purityMatch = rawPurity.match(/\d+/);
  const purity = purityMatch ? purityMatch[0] : "";

  // ✅ FIX 2: Safe rate access + fallback
  let rate = 0;

  if (silverRates && purity && silverRates[purity] !== undefined) {
    rate = Number(silverRates[purity]);
  }

  // 🔥 DEBUG (VERY IMPORTANT)
  console.log("---- SILVER DEBUG ----");
  console.log("Purity:", purity);
  console.log("Available Rates:", silverRates);
  console.log("Rate Used:", rate);
  console.log("Weight:", weight);

  // ✅ FIX 3: Prevent NaN issues
  const silverPrice = weight * rate || 0;

  // ✅ GST
  const metalGST = silverPrice * 0.03;
  const makingGST = making * 0.05;
  const totalGST = metalGST + makingGST;

  const final = silverPrice + making + totalGST;

  return {
    basePrice: silverPrice,
    rate,        // ✅ useful for UI/debug
    purity,      // ✅ debug
    making,
    metalGST,
    makingGST,
    totalGST,
    final,
  };
};

export const calculateSilverFinalPrice = (
  product: Product,
  silverRates: any
): string => {
  const breakdown = calculateSilverPriceBreakdown(product, silverRates);
  return breakdown ? breakdown.final.toFixed(2) : "0.00";
};