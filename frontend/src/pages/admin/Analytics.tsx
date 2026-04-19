import { useEffect, useState } from "react";
import axios from "axios";

const Analytics = () => {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/orders/analytics/top-customers")
      .then((res) => setData(res.data));
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>📊 Analytics</h1>

      <div style={styles.grid}>

        <div style={styles.card}>
          <h3>🏆 Customer of the Year</h3>
          <p style={styles.name}>
            {data.customerOfYear?.name || "No data"}
          </p>
          <p>{data.customerOfYear?.totalGold || 0} g</p>
        </div>

        <div style={styles.card}>
          <h3>👑 Victory Customer</h3>
          <p style={styles.name}>
            {data.victoryCustomer?.name || "No data"}
          </p>
          <p>{data.victoryCustomer?.totalGold || 0} g</p>
        </div>

      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    background: "#f4f6f9",
    minHeight: "100vh",
  },

  heading: {
    textAlign: "center" as const,
    marginBottom: "30px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    textAlign: "center" as const,
  },

  name: {
    fontWeight: "bold",
    color: "#D4AF37",
    fontSize: "18px",
  },
};

export default Analytics;