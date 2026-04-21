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

  const handleApprove = async (id: string) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}/approve`);
      alert("✅ Order Approved and Stock Updated");
      fetchOrders();
    } catch (err: any) {
      alert("❌ " + (err.response?.data?.message || "Error approving order"));
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
              <div style={styles.details}>
                {order.items ? (
                  <>
                    <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "5px" }}>Multi-Item Order ({order.items.length})</h3>
                    <div style={{ maxHeight: "150px", overflowY: "auto", marginBottom: "10px" }}>
                      {order.items.map((item: any) => (
                        <div key={item._id || item.productId} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                          <img src={item.image} style={{ width: "50px", height: "50px", borderRadius: "5px", objectFit: "cover" }} />
                          <div>
                            <p style={{ margin: 0, fontWeight: "bold", fontSize: "13px" }}>{item.name}</p>
                            <p style={{ margin: 0, fontSize: "12px", color: "gray" }}>₹{item.price} x {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <img src={order.image} style={styles.image} />
                    <h3>{order.productName}</h3>
                  </>
                )}

                <p>💰 ₹{order.totalAmount || order.price}</p>
                <p>⚖️ {order.totalWeight || order.weight} g</p>

                <p>👤 {order.userName || "Unknown"}</p>
                <p style={styles.email}>{order.userEmail}</p>

                <p style={styles.orderId}>
                  🆔 {order.orderId}
                </p>
                
                {/* STATUS & BUTTONS */}
                <div style={{ marginTop: "15px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                  {order.status === "Pending Approval" && (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button 
                        style={{...styles.actionBtn, background: "#2ecc71"}} 
                        onClick={() => handleApprove(order._id)}
                      >
                        Approve
                      </button>
                    </div>
                  )}

                  {order.status === "Approved" && (
                    <div style={{ textAlign: "center" }}>
                      <p style={{ color: "#2ecc71", fontWeight: "bold", margin: "0 0 10px 0" }}>✔ Status: Approved</p>
                      {order.invoiceUrl && (
                        <a href={order.invoiceUrl} target="_blank" rel="noreferrer">
                          <button style={{...styles.actionBtn, background: "#34495e", width: "100%"}}>
                            View Final Invoice
                          </button>
                        </a>
                      )}
                    </div>
                  )}
                  
                  {(!order.status || order.status === "Completed") && (
                     <p style={{ color: "#f39c12", fontWeight: "bold", textAlign: "center", margin: 0 }}>Status: {order.status || 'Legacy'}</p>
                  )}
                </div>

              </div>

              <button
                style={styles.deleteBtn}
                onClick={() => deleteOrder(order._id)}
              >
                Delete Order
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
    background: "#ff4757",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  
  actionBtn: {
    flex: 1,
    padding: "8px",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  }
};

export default OrdersAdmin;