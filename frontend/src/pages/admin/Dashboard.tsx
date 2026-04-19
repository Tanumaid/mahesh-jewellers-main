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
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "20px"
  },
  card: {
    padding: "20px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
  }
};

export default Dashboard;