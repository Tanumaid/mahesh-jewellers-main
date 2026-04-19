import { useEffect, useState } from "react";
import axios from "axios";

const Orders = () => {

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user.email) return;

    axios.get(`http://localhost:5000/api/orders/${user.email}`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.log(err));
  }, []);

  // 💰 TOTAL MONEY
  const totalAmount = orders.reduce((total, order) => {
    return total + parseFloat(order.price || "0");
  }, 0);

  // 🪙 TOTAL GOLD (grams → tola)
  const totalGoldTola = orders.reduce((total, order) => {
    return total + (parseFloat(order.weight || "0") / 10);
  }, 0);

  if (orders.length === 0) {
    return <h2 style={{ padding: "40px" }}>No Orders Yet</h2>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h2 style={{ textAlign: "center" }}>My Orders</h2>

      {/* 🛍 Orders List */}
      {orders.map((order) => (
        <div key={order._id} style={styles.row}>
          <img src={order.image} style={styles.img} />

          <div>
            <h3>{order.productName}</h3>
            <p>₹{order.price}</p>
            <p>Weight: {order.weight || 0} g</p>
            <p>Order ID: {order.orderId}</p>
          </div>
        </div>
      ))}

      {/* ✅ SINGLE COMBINED BOX */}
      <div style={styles.box}>
        <h3>Total Purchase Summary</h3>

        <p style={styles.value}>
          💰 Total Amount: <strong>₹{totalAmount.toFixed(2)}</strong>
        </p>

        <p style={styles.value}>
          🪙 Total Gold: <strong>{totalGoldTola.toFixed(2)} Tola</strong>
        </p>
      </div>

    </div>
  );
};

const styles = {
  row: {
    display: "flex",
    gap: "20px",
    marginTop: "20px",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    paddingBottom: "15px",
  },

  img: {
    width: "100px",
    height: "100px",
    objectFit: "cover" as const,
    borderRadius: "8px",
  },

  box: {
    marginTop: "30px",
    padding: "25px",
    background: "#fff",
    textAlign: "center" as const,
    borderRadius: "12px",
    borderTop: "5px solid #D4AF37",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
    maxWidth: "500px",
    marginInline: "auto",
  },

  value: {
    marginTop: "10px",
    fontSize: "16px",
    color: "#444",
  },
};

export default Orders;