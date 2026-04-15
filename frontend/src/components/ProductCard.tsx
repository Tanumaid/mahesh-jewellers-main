import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import axios from "axios";

const ProductCard = ({ product }: any) => {

  const { addToCart } = useContext(CartContext)!;

  const [goldRate, setGoldRate] = useState<number>(0);

  // 🔥 Fetch gold rate
  useEffect(() => {
    axios.get("http://localhost:5000/api/goldrate")
      .then((res) => {
        setGoldRate(res.data?.ratePerGram || 0);
      })
      .catch(() => setGoldRate(0));
  }, []);

  // 🔥 Calculate dynamic price
  const calculatePrice = () => {
    const weight = parseFloat(product.weight) || 0;
    const making = parseFloat(product.makingCharges) || 0;
    const gst = parseFloat(product.gst) || 0;

    const base = weight * goldRate;
    const total = base + making;
    const final = total + (total * gst / 100);

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

      <button style={styles.btn} onClick={handleAddToCart}>
        Add To Cart
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