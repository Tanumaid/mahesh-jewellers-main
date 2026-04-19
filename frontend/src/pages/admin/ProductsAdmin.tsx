const Dashboard = () => {
  return (
    <div>
      <h2>Admin Dashboard</h2>

      <div style={styles.cards}>
        <div style={styles.card}>Total Products</div>
        <div style={styles.card}>Total Orders</div>
        <div style={styles.card}>Total Users</div>
        <div style={styles.card}>Revenue</div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    background: "#f5f6fa",
  },

  form: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    maxWidth: "400px",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },

  button: {
    padding: "10px",
    background: "#D4AF37",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },

  productCard: {
    display: "flex",
    gap: "15px",
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "15px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    alignItems: "center",
  },

  img: {
    width: "80px",
    height: "80px",
    objectFit: "cover" as const,
    borderRadius: "8px",
  },

  deleteBtn: {
    background: "red",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    cursor: "pointer",
  },
};

export default Dashboard;