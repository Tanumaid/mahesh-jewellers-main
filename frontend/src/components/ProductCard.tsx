import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import axios from "axios";
import { calculateFinalPrice, formatPrice } from "../utils/priceCalculator";

const ProductCard = ({ product }: any) => {

  const { addToCart } = useContext(CartContext)!;

  // 🔥 CHANGE THIS
  const [goldRates, setGoldRates] = useState<any>({});

  useEffect(() => {
    axios.get("http://localhost:5000/api/goldrate")
      .then((res) => {
        setGoldRates(res.data?.rates || {});
      })
      .catch(() => setGoldRates({}));
  }, []);

  // Local calculatePrice removed in favor of centralized utility.

  // 🔥 Add to cart
  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      name: product.name,
      price: calculateFinalPrice(product, goldRates), // ✅ dynamic price
      image: product.image,
      quantity: 1
    });

    alert("Added to Cart ✅");
  };

  // 🔥 Add to wishlist (with real user)
  const addToWishlist = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user.email) {
        alert("Please login first");
        return;
      }

      await axios.post("http://localhost:5000/api/wishlist", {
        productName: product.name,
        price: calculateFinalPrice(product, goldRates),
        image: product.image,
        userEmail: user.email
      });

      alert("Added to Wishlist ❤️");

    } catch (error) {
      console.log(error);
      alert("Error adding to wishlist");
    }
  };

  return (
    <div style={styles.card}>

      <img src={product.image} style={styles.image} />

      <h3>{product.name}</h3>

      {/* 🔥 Dynamic Price */}
      <p style={styles.price}>₹{formatPrice(calculateFinalPrice(product, goldRates))}</p>

      {/* Stock Badges */}
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
        {product.quantity === 0 && (
          <span style={{ padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", color: "#fff", backgroundColor: "#e74c3c" }}>
            Out of Stock
          </span>
        )}

        {product.quantity === 1 && (
          <span style={{ padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", color: "#fff", backgroundColor: "#e67e22" }}>
            Only 1 left
          </span>
        )}

        {product.soldCount >= 5 && (
          <span style={{ padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", backgroundColor: "#ffeb3b", color: "#d35400" }}>
            🔥 Trending
          </span>
        )}
      </div>

      <button 
        style={{
          ...styles.btn, 
          opacity: product.quantity === 0 ? 0.5 : 1, 
          cursor: product.quantity === 0 ? "not-allowed" : "pointer"
        }} 
        onClick={handleAddToCart}
        disabled={product.quantity === 0}
      >
        {product.quantity === 0 ? "Out of Stock" : "Add To Cart"}
      </button>

      <button style={styles.wishlistBtn} onClick={addToWishlist}>
        ❤️ Wishlist
      </button>

    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    textAlign: "center" as const,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)", // ✨ improved shadow
    borderRadius: "10px",
  },

  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover" as const,
    borderRadius: "8px",
  },

  price: {
    color: "#D4AF37",
    fontWeight: "bold",
    fontSize: "18px",
    marginTop: "5px",
  },

  btn: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },

  wishlistBtn: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#D4AF37",
    color: "#000",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },
};

export default ProductCard;