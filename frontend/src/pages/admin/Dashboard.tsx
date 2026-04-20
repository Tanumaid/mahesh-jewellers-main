import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {

  const [summary, setSummary] = useState<any>({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    day: 0,
    month: 0,
    year: 0
  });

  useEffect(() => {
    axios.get("http://localhost:5000/api/orders/summary")
      .then(res => {
        console.log("API DATA:", res.data); // 👈 CHECK THIS
        setSummary(res.data);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={styles.container}>

      <h2>📊 Admin Dashboard</h2>

      {/* 🔥 CARDS */}
      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>{summary.products}</h3>
          <p>Products</p>
        </div>

        <div style={styles.card}>
          <h3>{summary.orders}</h3>
          <p>Orders</p>
        </div>

        <div style={styles.card}>
          <h3>{summary.users}</h3>
          <p>Users</p>
        </div>

        <div style={styles.card}>
          <h3>₹{summary.revenue}</h3>
          <p>Revenue</p>
        </div>
      </div>

      {/* 📊 BAR CHART */}
      <div style={styles.chartBox}>
        <h3>Sales Overview</h3>
        <Bar
          data={{
            labels: ["Today", "Month", "Year"],
            datasets: [
              {
                label: "Sales ₹",
                data: [
                  summary.day || 0,
                  summary.month || 0,
                  summary.year || 0
                ]
              }
            ]
          }}
        />
      </div>

      {/* 📈 LINE CHART */}
      <div style={styles.chartBox}>
        <h3>Monthly Growth</h3>
        <Line
          data={{
            labels: ["Jan", "Feb", "Mar", "Apr", "May"],
            datasets: [
              {
                label: "Revenue ₹",
                data: [12000, 15000, 18000, 22000, 30000]
              }
            ]
          }}
        />
      </div>

    </div>
  );
};

const styles = {
  container: {
    padding: "20px"
  },

  cards: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px"
  },

  card: {
    padding: "20px",
    background: "#000",
    color: "#D4AF37",
    borderRadius: "10px",
    flex: 1,
    textAlign: "center" as const
  },

  chartBox: {
    marginTop: "30px",
    background: "#fff",
    padding: "20px",
    borderRadius: "10px"
  }
};

export default Dashboard;