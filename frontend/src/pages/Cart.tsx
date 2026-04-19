import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext)!;
  const navigate = useNavigate();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  // ⭐🔥 ADD THIS FUNCTION HERE
  const convertToGrams = (weightStr: any) => {
    if (!weightStr) return 1;

    if (typeof weightStr === "number") return weightStr;

    if (weightStr.includes("tola")) {
      return parseFloat(weightStr) * 11.66; // 1 tola = 11.66g
    }

    if (weightStr.includes("g")) {
      return parseFloat(weightStr);
    }

    return Number(weightStr) || 1;
  };

  const handlePlaceOrder = async (item: any) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user.email) {
        alert("Login required");
        navigate("/login");
        return;
      }

      setLoadingId(item.id); // 🔥 disable button

      const orderData = {
        productName: item.name,
        price: Number(item.price),
        image: item.image,
        userEmail: user.email,
        userName: user.name,
        weight: convertToGrams(item.weight), // ⭐ FIXED HERE
      };

      const res = await axios.post(
        "http://localhost:5000/api/orders",
        orderData
      );

      const orderId = res.data.orderId;

      clearCart(); // clear cart after success

      navigate("/order-success", {
        state: { orderId },
      });

    } catch (error: any) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Error placing order");
    } finally {
      setLoadingId(null); // 🔥 reset button
    }
  };

  // 🔥 Total calculation
  const totalAmount = cart.reduce((sum, item) => {
    return sum + Number(item.price || 0);
  }, 0);

  if (cart.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Your Cart is Empty</h2>

        <Link to="/products">
          <button style={styles.shopBtn}>Continue Shopping</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h2>Your Cart</h2>

      {cart.map((item) => (
        <div key={item.id} style={styles.cartItem}>
          <img src={item.image} alt={item.name} style={styles.image} />

          <div style={{ flex: 1 }}>
            <h3>{item.name}</h3>
            <p>₹{item.price}</p>

            <p style={styles.weightText}>
              Weight: {item.weight || "Not set"}
            </p>
          </div>

          <button
            style={{
              ...styles.orderBtn,
              opacity: loadingId === item.id ? 0.6 : 1,
              cursor: loadingId === item.id ? "not-allowed" : "pointer",
            }}
            disabled={loadingId === item.id}
            onClick={() => handlePlaceOrder(item)}
          >
            {loadingId === item.id ? "Placing..." : "Place Order"}
          </button>

          <button
            style={styles.removeBtn}
            onClick={() => removeFromCart(item.id)}
          >
            Remove
          </button>
        </div>
      ))}

      <div style={styles.totalBox}>
        Total Amount: ₹{totalAmount.toFixed(2)}
      </div>
    </div>
  );
};

const styles = {
  cartItem: {
    display: "flex",
    gap: "20px",
    marginTop: "20px",
    alignItems: "center",
    borderBottom: "1px solid #ddd",
    paddingBottom: "15px",
  },

  image: {
    width: "100px",
    height: "100px",
    objectFit: "cover" as const,
  },

  weightText: {
    fontSize: "12px",
    color: "gray",
  },

  removeBtn: {
    padding: "8px 15px",
    backgroundColor: "red",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },

  orderBtn: {
    padding: "10px 20px",
    backgroundColor: "#D4AF37",
    color: "#000",
    border: "none",
    fontWeight: "bold",
  },

  shopBtn: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },

  totalBox: {
    marginTop: "30px",
    textAlign: "right" as const,
    fontSize: "20px",
    fontWeight: "bold",
    color: "#D4AF37",
  },
};

export default Cart;