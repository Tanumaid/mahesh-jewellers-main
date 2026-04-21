import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext)!;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const convertToGrams = (weightStr: any) => {
    if (!weightStr) return 1;
    if (typeof weightStr === "number") return weightStr;
    if (weightStr.includes("tola")) return parseFloat(weightStr) * 11.66;
    if (weightStr.includes("g")) return parseFloat(weightStr);
    return Number(weightStr) || 1;
  };

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

  const handlePlaceOrder = async () => {
    const expiredItems = cart.filter(item => isExpired(item.addedAt));
    if (expiredItems.length > 0) {
      alert("Some items in your cart have expired. Please remove them to proceed. ❌");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user.email) {
        alert("Login required");
        navigate("/login");
        return;
      }

      setLoading(true);

      const itemsPayload = cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: Number(item.price),
        image: item.image,
        quantity: item.quantity || 1,
        weight: convertToGrams(item.weight),
      }));

      const orderData = {
        items: itemsPayload,
        userEmail: user.email,
        userName: user.name,
      };

      const res = await axios.post(
        "http://localhost:5000/api/orders/book",
        orderData
      );

      const orderId = res.data.orderId;

      clearCart();
      alert("Payment of 30% Advance Successful!");

      navigate("/order-success", {
        state: { orderId },
      });

    } catch (error: any) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => {
    return sum + (Number(item.price || 0) * (item.quantity || 1));
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
        const itemQuantity = item.quantity || 1;

        return (
          <div key={item.id} style={styles.cartItem}>
            <img src={item.image} alt={item.name} style={styles.image} />

            <div style={{ flex: 1 }}>
              <h3>{item.name}</h3>
              <p>₹{item.price}</p>
              
              <div style={styles.quantityControl}>
                 <button onClick={() => updateQuantity(item.id, itemQuantity - 1)} disabled={itemQuantity <= 1}>-</button>
                 <span>{itemQuantity}</span>
                 <button onClick={() => updateQuantity(item.id, itemQuantity + 1)}>+</button>
              </div>

              <p style={styles.weightText}>
                Weight: {item.weight || "Not set"} | Subtotal: ₹{(Number(item.price) * itemQuantity).toFixed(2)}
              </p>

              <p style={{ color: expired ? "gray" : "red", fontSize: "13px", fontWeight: "bold" }}>
                ⏳ {getRemainingTime(item.addedAt)}
              </p>
            </div>

            <button style={styles.removeBtn} onClick={() => removeFromCart(item.id)}>
              Remove
            </button>
          </div>
        );
      })}

      <div style={styles.totalBox}>
        <div style={{ fontSize: "16px", color: "#555", marginBottom: "10px" }}>
          Total Amount: ₹{totalAmount.toFixed(2)}
        </div>
        <div style={{ fontSize: "20px", color: "#27ae60", fontWeight: "bold" }}>
          Advance to Pay (30%): ₹{(totalAmount * 0.30).toFixed(2)}
        </div>
        <div style={{ fontSize: "16px", color: "#e74c3c", marginTop: "5px" }}>
          Remaining (Pay at Store): ₹{(totalAmount * 0.70).toFixed(2)}
        </div>
        <br />
        <button
          style={{
            ...styles.orderBtn,
            opacity: loading || cart.some(i => isExpired(i.addedAt)) ? 0.5 : 1,
            cursor: loading || cart.some(i => isExpired(i.addedAt)) ? "not-allowed" : "pointer",
            marginTop: "15px"
          }}
          disabled={loading || cart.some(i => isExpired(i.addedAt))}
          onClick={handlePlaceOrder}
        >
          {loading ? "Processing..." : "Pay Advance & Book Order"}
        </button>
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
  quantityControl: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "10px 0"
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
    padding: "15px 30px",
    backgroundColor: "#D4AF37",
    color: "#000",
    border: "none",
    fontWeight: "bold",
    fontSize: "16px"
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
    fontSize: "24px",
    fontWeight: "bold",
    color: "#000",
  },
};

export default Cart;