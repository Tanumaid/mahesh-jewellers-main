import { useEffect, useState } from "react";
import axios from "axios";

const UsersAdmin = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/orders/users-with-orders")
      .then((res) => setUsers(res.data));
  }, []);

  return (
    <div>
      <h2>Users & Purchase History</h2>

      {users.map((u) => (
        <div key={u._id} style={styles.card}>
          <h3>{u.name || u._id}</h3>
          <p>Email: {u._id}</p>

          <p>Total Gold: {u.totalGold} g</p>
          <p>Total Spent: ₹{u.totalSpent}</p>

          <details>
            <summary>Orders</summary>

            {u.orders.map((o: any) => (
              <div key={o._id} style={styles.order}>
                {o.productName} - ₹{o.price}
              </div>
            ))}
          </details>
        </div>
      ))}
    </div>
  );
};

const styles = {
  card: {
    padding: "15px",
    marginBottom: "15px",
    border: "1px solid #ddd",
    borderRadius: "10px"
  },
  order: {
    fontSize: "14px",
    marginLeft: "10px"
  }
};

export default UsersAdmin;