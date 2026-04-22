import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import type { Product } from "../types/Product";

// ✅ IMPORT SEPARATE CALCULATORS
import { calculateGoldPriceBreakdown, calculateGoldFinalPrice } from "../utils/goldPriceCalculator";
import { calculateSilverPriceBreakdown, calculateSilverFinalPrice } from "../utils/silverPriceCalculator";
import { formatPrice } from "../utils/priceCalculator";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useContext(CartContext)!;

  const [product, setProduct] = useState<Product | null>(null);
  const [goldRates, setGoldRates] = useState<any>({});
  const [silverRates, setSilverRates] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // ✅ Fetch product
    axios.get("http://localhost:5000/api/products")
      .then((res) => {
        const foundProduct = res.data.find((p: Product) => p._id === id);
        setProduct(foundProduct);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // ✅ Fetch gold rates
    axios.get("http://localhost:5000/api/goldrate")
      .then((res) => setGoldRates(res.data?.rates || {}))
      .catch(() => setGoldRates({}));

    // ✅ Fetch silver rates
    axios.get("http://localhost:5000/api/silverrate")
      .then((res) => setSilverRates(res.data?.rates || {}))
      .catch(() => setSilverRates({}));

  }, [id]);

  if (loading) {
    return <h2 style={{ padding: "40px" }}>Loading...</h2>;
  }

  if (!product) {
    return <h2 style={{ padding: "40px" }}>Product not found</h2>;
  }

  // ✅ 🔥 FIX: Detect metal safely (VERY IMPORTANT)
  const metalType =
    product.metal?.toLowerCase() ||
    (product.purity?.toLowerCase().includes("silver") ? "silver" : "gold");

  // ✅ SELECT CALCULATOR
  let priceData: any = null;

  if (metalType === "gold") {
    priceData = calculateGoldPriceBreakdown(product, goldRates);
  } else if (metalType === "silver") {
    priceData = calculateSilverPriceBreakdown(product, silverRates);
  }

  // 🛒 Add to cart
  const handleAddToCart = () => {
    let finalPrice = "0.00";

    if (metalType === "gold") {
      finalPrice = calculateGoldFinalPrice(product, goldRates);
    } else if (metalType === "silver") {
      finalPrice = calculateSilverFinalPrice(product, silverRates);
    }

    addToCart({
      id: product._id,
      name: product.name,
      price: finalPrice,
      image: product.image,
      quantity: 1,
      weight: product.weight || "0",
    });

    alert("Added to Cart ✅");
  };

  return (
    <div style={styles.container}>

      <div style={styles.imageBox}>
        <img src={product.image} style={styles.image} alt={product.name} />
      </div>

      <div style={styles.details}>
        <h2>{product.name}</h2>

        <p><strong>Weight:</strong> {product.weight} grams</p>
        <p><strong>Purity:</strong> {product.purity}</p>
        <p><strong>Making Charges:</strong> ₹{formatPrice(product.makingCharges || "0")}</p>

        {/* 💰 FINAL PRICE */}
        <h3 style={styles.price}>
          Price: ₹{priceData ? formatPrice(priceData.final) : "0.00"}
        </h3>

        {/* 🔥 PRICE BREAKDOWN */}
        <div style={styles.breakdown}>
          <p>
            <strong>
              {metalType === "gold" ? "Gold Price" : "Silver Price"}:
            </strong>{" "}
            ₹{priceData ? formatPrice(priceData.basePrice) : "0.00"}
          </p>

          <p>
            <strong>Making:</strong> ₹
            {priceData ? formatPrice(priceData.making) : "0.00"}
          </p>

          <p>
            <strong>GST (3% metal + 5% making):</strong> ₹
            {priceData ? formatPrice(priceData.totalGST) : "0.00"}
          </p>
        </div>

        <button style={styles.btn} onClick={handleAddToCart}>
          Add To Cart
        </button>
      </div>

    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    gap: "40px",
    padding: "60px",
    flexWrap: "wrap" as const,
  },

  imageBox: {
    flex: 1,
    textAlign: "center" as const,
  },

  image: {
    width: "100%",
    maxWidth: "400px",
    borderRadius: "10px",
  },

  details: {
    flex: 1,
  },

  price: {
    color: "#D4AF37",
    marginTop: "10px",
    fontSize: "24px",
    fontWeight: "bold",
  },

  breakdown: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#555",
    background: "#fafafa",
    padding: "10px",
    borderRadius: "8px",
  },

  btn: {
    marginTop: "20px",
    padding: "12px 25px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "6px",
  },
};

export default ProductDetails;