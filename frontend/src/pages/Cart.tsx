import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext)!;
  const navigate = useNavigate();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const convertToGrams = (weightStr: any) => {
    if (!weightStr) return 1;

    if (typeof weightStr === "number") return weightStr;

    if (weightStr.includes("tola")) {
      return parseFloat(weightStr) * 11.66;
    }

    if (weightStr.includes("g")) {
      return parseFloat(weightStr);
    }

    return Number(weightStr) || 1;
  };

  // 🔥 TIME LEFT FUNCTION
  const getRemainingTime = (addedAt: number) => {
    if (!addedAt) return "Unknown";

    const diff = 24 * 60 * 60 * 1000 - (Date.now() - addedAt);

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return `${hours}h ${minutes}m left`;
  };

  const isExpired = (addedAt: number) => {
    return Date.now() - addedAt > 24 * 60 * 60 * 1000;
  };

  const handlePlaceOrder = async (item: any) => {
    // 🔥 BLOCK EXPIRED ITEMS
    if (isExpired(item.addedAt)) {
      alert("This item has expired ❌");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user.email) {
        alert("Login required");
        navigate("/login");
        return;
      }

      setLoadingId(item.id);

      const orderData = {
        productName: item.name,
        price: Number(item.price),
        image: item.image,
        userEmail: user.email,
        userName: user.name,
        weight: convertToGrams(item.weight),
      };

      const res = await axios.post(
        "http://localhost:5000/api/orders",
        orderData
      );

      const orderId = res.data.orderId;

      clearCart();

      navigate("/order-success", {
        state: { orderId },
      });

    } catch (error: any) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Error placing order");
    } finally {
      setLoadingId(null);
    }
  };

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

      {cart.map((item) => {
        const expired = isExpired(item.addedAt);

        return (
          <div key={item.id} style={styles.cartItem}>
            <img src={item.image} alt={item.name} style={styles.image} />

            <div style={{ flex: 1 }}>
              <h3>{item.name}</h3>
              <p>₹{item.price}</p>

              <p style={styles.weightText}>
                Weight: {item.weight || "Not set"}
              </p>

              {/* 🔥 TIMER DISPLAY */}
              <p
                style={{
                  color: expired ? "gray" : "red",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                ⏳ {getRemainingTime(item.addedAt)}
              </p>
            </div>

            <button
              style={{
                ...styles.orderBtn,
                opacity:
                  loadingId === item.id || expired ? 0.5 : 1,
                cursor:
                  loadingId === item.id || expired
                    ? "not-allowed"
                    : "pointer",
                backgroundColor: expired ? "gray" : "#D4AF37",
              }}
              disabled={loadingId === item.id || expired}
              onClick={() => handlePlaceOrder(item)}
            >
              {expired
                ? "Expired"
                : loadingId === item.id
                ? "Placing..."
                : "Place Order"}
            </button>

            <button
              style={styles.removeBtn}
              onClick={() => removeFromCart(item.id)}
            >
              Remove
            </button>
          </div>
        );
      })}

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