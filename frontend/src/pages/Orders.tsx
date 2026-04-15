import { useEffect, useState } from "react";
import axios from "axios";

const Orders = () => {

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user.email) return;

    axios.get(`http://localhost:5000/api/orders/${user.email}`)
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

  }, []);

  if (orders.length === 0) {
    return <h2 style={{ padding: "40px" }}>No Orders Yet</h2>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h2>My Orders</h2>

      {orders.map((order) => (
        <div key={order._id} style={styles.orderItem}>
          
          <img src={order.image} style={styles.image} />

          <div>
            <h3>{order.productName}</h3>
            <p>{order.price}</p>
            <p>Order ID: {order.orderId}</p>
            <p>User: {order.userEmail}</p>

            {/* ⭐ ADDED DATE */}
            <p>
              Date: {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>

          </div>

        </div>
      ))}

    </div>
  );
};

const styles = {
  orderItem: {
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
};

export default Orders;