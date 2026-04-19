import { useEffect, useState } from "react";
import axios from "axios";

const OrdersAdmin = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch all orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      setOrders(res.data);
    } catch (error) {
      console.log("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔥 Delete Order
  const deleteOrder = async (id: string) => {
    const confirmDelete = window.confirm("Delete this order?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/orders/${id}`);
      fetchOrders();
    } catch (error) {
      alert("Error deleting order");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📦 Orders Management</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div style={styles.grid}>
          {orders.map((order) => (
            <div key={order._id} style={styles.card}>
              <img src={order.image} style={styles.image} />

              <div style={styles.details}>
                <h3>{order.productName}</h3>

                <p>💰 ₹{order.price}</p>
                <p>⚖️ {order.weight} g</p>

                <p>👤 {order.userName || "Unknown"}</p>
                <p style={styles.email}>{order.userEmail}</p>

                <p style={styles.orderId}>
                  🆔 {order.orderId}
                </p>
              </div>

              <button
                style={styles.deleteBtn}
                onClick={() => deleteOrder(order._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    background: "#f5f5f5",
    minHeight: "100vh",
  },

  heading: {
    textAlign: "center" as const,
    marginBottom: "30px",
    color: "#333",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "15px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },

  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover" as const,
    borderRadius: "10px",
  },

  details: {
    fontSize: "14px",
  },

  email: {
    fontSize: "12px",
    color: "gray",
  },

  orderId: {
    fontSize: "12px",
    color: "#555",
  },

  deleteBtn: {
    marginTop: "10px",
    padding: "10px",
    background: "red",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default OrdersAdmin;