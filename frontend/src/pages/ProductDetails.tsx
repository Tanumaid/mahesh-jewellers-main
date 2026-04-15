import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import type { Product } from "../types/Product";

const ProductDetails = () => {

  const { id } = useParams<{ id: string }>();
  const { addToCart } = useContext(CartContext)!;

  const [product, setProduct] = useState<Product | null>(null);
  const [goldRate, setGoldRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // 🔥 Fetch product
    axios.get("http://localhost:5000/api/products")
      .then((res) => {
        const foundProduct = res.data.find((p: Product) => p._id === id);
        setProduct(foundProduct);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // 🔥 Fetch gold rate
    axios.get("http://localhost:5000/api/goldrate")
      .then((res) => {
        setGoldRate(res.data?.ratePerGram || 0);
      })
      .catch(() => setGoldRate(0));

  }, [id]);

  // 🔥 Price calculation
 const calculatePrice = () => {
  if (!product) return "0";
  if (!goldRate) return product.price || "0";  // ✅ FIX

  const weight = parseFloat(product.weight || "0");
  const making = parseFloat(product.makingCharges || "0");
  const gst = parseFloat(product.gst || "0");

  const base = weight * goldRate;
  const total = base + making;
  const final = total + (total * gst / 100);

  return final.toFixed(2);
};

  // 🔥 Loading state
  if (loading) {
    return <h2 style={{ padding: "40px" }}>Loading...</h2>;
  }

  if (!product) {
    return <h2 style={{ padding: "40px" }}>Product not found</h2>;
  }

  // 🔥 Add to cart
  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      name: product.name,
      price: calculatePrice(),
      image: product.image,
      quantity: 1,
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
        <p><strong>GST:</strong> {product.gst}%</p>

        {/* 🔥 Dynamic Price */}
        <h3 style={styles.price}>
          Price: ₹{calculatePrice()}
        </h3>

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