import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const { cart, removeFromCart, placeOrder } = useContext(CartContext)!;
  const navigate = useNavigate();

  const handlePlaceOrder = async (item: any) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user.email) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      // ✅ SINGLE API CALL (FIXED)
      const res = await axios.post("http://localhost:5000/api/orders", {
        productName: item.name,
        price: item.price,
        image: item.image,
        userEmail: user.email, // 🔥 dynamic user
      });

      const orderId = res.data.orderId;

      // ✅ Update local context
      placeOrder(item);

      // ✅ Navigate to success page
      navigate("/order-success", {
        state: { orderId },
      });

    } catch (error) {
      console.log(error);
      alert("Error placing order");
    }
  };

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
          </div>

          <button
            style={styles.orderBtn}
            onClick={() => handlePlaceOrder(item)}
          >
            Place Order
          </button>

          <button
            style={styles.removeBtn}
            onClick={() => removeFromCart(item.id)}
          >
            Remove
          </button>
        </div>
      ))}
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
    cursor: "pointer",
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
};

export default Cart;