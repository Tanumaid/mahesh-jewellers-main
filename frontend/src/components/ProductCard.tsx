import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import axios from "axios";

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

  // 🔥 FIXED PRICE CALCULATION
  const calculatePrice = () => {
    const weight = parseFloat(product.weight) || 0;
    const making = parseFloat(product.makingCharges) || 0;
    const purity = product.purity || "22K";

    const rate = goldRates[purity] || 0;

    const goldPrice = weight * rate;

    // ✅ Correct GST split
    const goldGST = goldPrice * 0.03;
    const makingGST = making * 0.05;

    const final = goldPrice + making + goldGST + makingGST;

    return final.toFixed(2);
  };

  // 🔥 Add to cart
  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      name: product.name,
      price: calculatePrice(), // ✅ dynamic price
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
        price: calculatePrice(),
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
      <p style={styles.price}>₹{calculatePrice()}</p>

      {/* Stock Badges */}
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
        {product.stockStatus && (
          <span style={{ 
            padding: "4px 8px", 
            borderRadius: "12px", 
            fontSize: "12px", 
            fontWeight: "bold",
            color: "#fff",
            backgroundColor: product.stockStatus === "In Stock" ? "#27ae60" : 
                             product.stockStatus === "Out of Stock" ? "#e74c3c" : "#e67e22" 
          }}>
            {product.stockStatus}
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