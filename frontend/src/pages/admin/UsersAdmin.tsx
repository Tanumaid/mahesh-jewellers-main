import { useEffect, useState } from "react";
import axios from "axios";

const UsersAdmin = () => {

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/orders/users-with-orders")
      .then((res) => setUsers(res.data));
  }, []);

  // ✅ FORMAT DATE
  const formatCustomerSince = (dateStr: string) => {
    const date = new Date(dateStr);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ✅ CALCULATE DURATION
  const getCustomerDuration = (dateStr: string) => {
    const start = new Date(dateStr);
    const now = new Date();

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return `${years} yr ${months} mo ${days} days`;
  };

  return (
    <div style={styles.container}>

      <h2 style={styles.heading}>👥 Users Management</h2>

      <div style={styles.layout}>

        {/* 🔹 LEFT SIDEBAR */}
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Customers</h3>

          {users.map((u) => (
            <div
              key={u._id}
              style={{
                ...styles.userCard,
                ...(selectedUser?._id === u._id ? styles.activeUser : {})
              }}
              onClick={() => setSelectedUser(u)}
            >
              <h4>{u.name || u.email?.split("@")[0]}</h4>
              <p style={styles.email}>{u.email || u._id}</p>
            </div>
          ))}
        </div>

        {/* 🔹 RIGHT PANEL */}
        <div style={styles.details}>

          {!selectedUser && (
            <div style={styles.emptyState}>
              <h3>Select a customer to view details</h3>
            </div>
          )}

          {selectedUser && (
            <>
              {/* 🔥 USER INFO */}
              <div style={styles.userCardBig}>
                <h2>{selectedUser.name || selectedUser.email}</h2>
                <p>{selectedUser.email}</p>

                <div style={styles.stats}>
                  <div style={styles.statBox}>
                    ⚖ {selectedUser.totalGold} g
                    <br />Total Gold
                  </div>

                  <div style={styles.statBox}>
                    💰 ₹{selectedUser.totalSpent}
                    <br />Total Spent
                  </div>

                  <div style={styles.statBox}>
                    📅{" "}
                    {selectedUser.firstOrderDate
                      ? formatCustomerSince(selectedUser.firstOrderDate)
                      : "N/A"}
                    <br />
                    Since
                  </div>

                  <div style={styles.statBox}>
                    ⏳{" "}
                    {selectedUser.firstOrderDate
                      ? getCustomerDuration(selectedUser.firstOrderDate)
                      : "N/A"}
                    <br />
                    Duration
                  </div>
                </div>
              </div>

              {/* 🔥 PURCHASE HISTORY */}
              <h3 style={styles.historyTitle}>🛒 Purchase History</h3>

              <div style={styles.ordersGrid}>
                {selectedUser.orders.map((o: any) => (
                  <div
                    key={o._id}
                    style={styles.orderCard}
                    onClick={() => setSelectedOrder(o)}
                  >
                    <img
                      src={o.image}
                      alt={o.productName}
                      style={styles.orderImage}
                    />

                    <h4>{o.productName}</h4>

                    <p>💰 ₹{o.price}</p>
                    <p>⚖ {o.weight} g</p>

                    <p style={styles.date}>
                      📅 {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 🔥 MODAL */}
      {selectedOrder && (
        <div
          style={styles.modalOverlay}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedOrder.image}
              style={styles.modalImage}
            />

            <h2>{selectedOrder.productName}</h2>

            <p><b>Price:</b> ₹{selectedOrder.price}</p>
            <p><b>Weight:</b> {selectedOrder.weight} g</p>
            <p>
              <b>Date:</b>{" "}
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </p>

            <button
              style={styles.closeBtn}
              onClick={() => setSelectedOrder(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    background: "#f5f7fb",
    minHeight: "100vh",
  },

  heading: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "20px",
  },

  layout: {
    display: "flex",
    gap: "20px",
  },

  sidebar: {
    width: "280px",
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  sidebarTitle: {
    marginBottom: "15px",
    color: "#D4AF37",
  },

  userCard: {
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "10px",
    cursor: "pointer",
    background: "#f1f3f6",
  },

  activeUser: {
    background: "#D4AF37",
    color: "#000",
  },

  email: {
    fontSize: "12px",
    color: "#555",
  },

  details: {
    flex: 1,
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  emptyState: {
    textAlign: "center" as const,
    marginTop: "50px",
    color: "#777",
  },

  userCardBig: {
    marginBottom: "20px",
  },

  stats: {
    display: "flex",
    gap: "15px",
    marginTop: "15px",
    flexWrap: "wrap" as const,
  },

  statBox: {
    background: "#f1f3f6",
    padding: "12px",
    borderRadius: "8px",
    minWidth: "150px",
    textAlign: "center" as const,
    fontSize: "14px",
  },

  historyTitle: {
    margin: "20px 0 10px",
  },

  ordersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "15px",
  },

  orderCard: {
    background: "#fff",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    cursor: "pointer",
  },

  orderImage: {
    width: "100%",
    height: "140px",
    objectFit: "cover" as const,
    borderRadius: "8px",
  },

  date: {
    fontSize: "12px",
    color: "#777",
  },

  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "300px",
    textAlign: "center" as const,
  },

  modalImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover" as const,
    borderRadius: "8px",
  },

  closeBtn: {
    marginTop: "10px",
    padding: "8px 15px",
    background: "red",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default UsersAdmin;