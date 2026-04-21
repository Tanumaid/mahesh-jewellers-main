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
    return total + parseFloat(order.totalAmount || order.price || "0");
  }, 0);

  // 🪙 TOTAL GOLD (grams → tola)
  const totalGoldTola = orders.reduce((total, order) => {
    return total + (parseFloat(order.totalWeight || order.weight || "0") / 10);
  }, 0);

  if (orders.length === 0) {
    return <h2 style={{ padding: "40px" }}>No Orders Yet</h2>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h2 style={{ textAlign: "center" }}>My Orders</h2>

      {/* 🛍 Orders List */}
      {orders.map((order) => (
        <div key={order._id} style={styles.orderContainer}>
          <div style={styles.orderHeader}>
             <div>
               <p><strong>Order ID:</strong> {order.orderId}</p>
               <p style={{ marginTop: "5px" }}>
                 <span style={{ 
                   padding: "3px 8px", 
                   borderRadius: "12px", 
                   fontSize: "12px", 
                   fontWeight: "bold",
                   background: order.status === 'Pending Approval' ? '#f39c12' : order.status === 'Approved' ? '#2ecc71' : '#e74c3c',
                   color: '#fff'
                 }}>
                   {order.status || 'Legacy'}
                 </span>
                 <span style={{ fontSize: "12px", marginLeft: "10px", color: "#555" }}>
                   Payment: {order.paymentStatus || 'Completed'}
                 </span>
               </p>
             </div>
             <div style={{ textAlign: "right" }}>
               <p><strong>Total:</strong> ₹{order.totalAmount || order.price}</p>
               {order.status === "Approved" && (
                 <button 
                   style={{...styles.btn, marginTop: "10px", fontSize: "12px", padding: "6px 12px"}}
                   onClick={() => window.open(`http://localhost:5000/api/orders/${order.orderId}/invoice`, "_blank")}
                 >
                   Download Final Invoice
                 </button>
               )}
             </div>
          </div>
          
          {/* Legacy Order Compatibility */}
          {order.productName && !order.items && (
            <div style={styles.row}>
              <img src={order.image} style={styles.img} />
              <div>
                <h3>{order.productName}</h3>
                <p>₹{order.price}</p>
                <p>Weight: {order.weight || 0} g</p>
              </div>
            </div>
          )}

          {/* New Multi-Item Orders */}
          {order.items && order.items.map((item: any) => (
            <div key={item._id || item.productId} style={styles.row}>
              <img src={item.image} style={styles.img} />
              <div>
                <h3>{item.name}</h3>
                <p>₹{item.price} x {item.quantity}</p>
                <p>Weight: {item.weight || 0} g</p>
                <p>Subtotal: ₹{Number(item.price) * Number(item.quantity)}</p>
              </div>
            </div>
          ))}
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
  orderContainer: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "2px solid #eee",
    paddingBottom: "10px",
    marginBottom: "10px",
    fontSize: "16px",
  },
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
  btn: {
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px"
  }
};

export default Orders;