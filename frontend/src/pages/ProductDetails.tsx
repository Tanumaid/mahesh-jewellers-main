import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import type { Product } from "../types/Product";

const ProductDetails = () => {

  const { id } = useParams<{ id: string }>();
  const { addToCart } = useContext(CartContext)!;

  const [product, setProduct] = useState<Product | null>(null);
  const [goldRates, setGoldRates] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    axios.get("http://localhost:5000/api/products")
      .then((res) => {
        const foundProduct = res.data.find((p: Product) => p._id === id);
        setProduct(foundProduct);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    axios.get("http://localhost:5000/api/goldrate")
      .then((res) => {
        setGoldRates(res.data?.rates || {});
      })
      .catch(() => setGoldRates({}));

  }, [id]);

  // ✅ UPDATED PRICE FUNCTION (returns full breakdown)
  const calculatePrice = () => {
    if (!product) return null;

    const weight = parseFloat(product.weight || "0");
    const making = parseFloat(product.makingCharges || "0");
    const purity = product.purity || "22K";

    const rate = goldRates[purity] || 0;

    const goldPrice = weight * rate;
    const goldGST = goldPrice * 0.03;
    const makingGST = making * 0.05;

    const final = goldPrice + making + goldGST + makingGST;

    return {
      goldPrice,
      making,
      goldGST,
      makingGST,
      final
    };
  };

  const priceData = calculatePrice();

  if (loading) {
    return <h2 style={{ padding: "40px" }}>Loading...</h2>;
  }

  if (!product) {
    return <h2 style={{ padding: "40px" }}>Product not found</h2>;
  }

  // 🛒 Add to cart
  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      name: product.name,
      price: priceData?.final.toFixed(2),
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
        <p><strong>Making Charges:</strong> ₹{product.makingCharges}</p>

        {/* 💰 FINAL PRICE */}
        <h3 style={styles.price}>
          Price: ₹{priceData?.final.toFixed(2)}
        </h3>

        {/* 🔥 PRICE BREAKDOWN (NEW FEATURE) */}
        <div style={styles.breakdown}>
          <p>Gold Price: ₹{priceData?.goldPrice.toFixed(2)}</p>
          <p>Making: ₹{priceData?.making}</p>
          <p>GST (3% Gold): ₹{priceData?.goldGST.toFixed(2)}</p>
          <p>GST (5% Making): ₹{priceData?.makingGST.toFixed(2)}</p>
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