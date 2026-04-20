import { useEffect, useState } from "react";
import axios from "axios";

const Offers = () => {

  const [orders, setOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // 🔥 FIXED ANALYTICS LOGIC
    axios.get("http://localhost:5000/api/orders/users-with-orders")
      .then((res) => {
        const sorted = (res.data || []).sort(
          (a: any, b: any) => b.totalGold - a.totalGold
        );

        setAnalytics({
          customerOfYear: sorted[0] || null,
          victoryCustomer: sorted[1] || null,
        });
      })
      .catch(() => console.log("Error loading analytics"));

    if (user.email) {
      axios.get(`http://localhost:5000/api/orders/${user.email}`)
        .then((res) => setOrders(res.data))
        .catch(() => console.log("Error loading orders"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

  }, []);

  if (loading) {
    return <h2 style={styles.loading}>Loading Offers...</h2>;
  }

  // 📅 Filters
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  const oneYearOrders = orders.filter(o => new Date(o.createdAt) >= oneYearAgo);
  const fiveYearOrders = orders.filter(o => new Date(o.createdAt) >= fiveYearsAgo);

  const totalTola1Year = oneYearOrders.reduce(
    (t, o) => t + (parseFloat(o.weight || "0") / 10), 0
  );

  const totalTola5Year = fiveYearOrders.reduce(
    (t, o) => t + (parseFloat(o.weight || "0") / 10), 0
  );

  return (
    <div style={styles.page}>

      <h1 style={styles.title}>🎁 Special Offers</h1>

      {/* 🔥 OFFERS */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🔥 Current Offers</h3>

        <div style={styles.offerList}>
          <div style={styles.offerItem}>✨ 10% OFF on Making Charges</div>
          <div style={styles.offerItem}>💎 ₹2000 OFF above ₹50,000</div>
          <div style={styles.offerItem}>🎉 Festival Special Discounts</div>
          <div style={styles.offerItem}>👑 Loyal Customer Benefits</div>
        </div>
      </div>

      {/* 🪙 GOLD JOURNEY */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🪙 Your Gold Journey</h3>

        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <p style={styles.statLabel}>Last 1 Year</p>
            <h2 style={styles.statValue}>{totalTola1Year.toFixed(2)} Tola</h2>
          </div>

          <div style={styles.statBox}>
            <p style={styles.statLabel}>Last 5 Years</p>
            <h2 style={styles.statValue}>{totalTola5Year.toFixed(2)} Tola</h2>
          </div>
        </div>

        {orders.length === 0 && (
          <p style={styles.empty}>No purchases yet — start shopping 💎</p>
        )}
      </div>

      {/* 🏆 TOP CUSTOMERS */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🏆 Top Customers</h3>

        {analytics ? (
          <div style={styles.statsRow}>

            <div style={styles.statBox}>
              <p style={styles.statLabel}>🥇 Customer of the Year</p>
              <h4>
                {analytics.customerOfYear?.name ||
                 analytics.customerOfYear?.email ||
                 "No data"}
              </h4>
              <p style={styles.goldText}>
                {analytics.customerOfYear?.totalGold || 0} g
              </p>
            </div>

            <div style={styles.statBox}>
              <p style={styles.statLabel}>👑 Victory Customer</p>
              <h4>
                {analytics.victoryCustomer?.name ||
                 analytics.victoryCustomer?.email ||
                 "No data"}
              </h4>
              <p style={styles.goldText}>
                {analytics.victoryCustomer?.totalGold || 0} g
              </p>
            </div>

          </div>
        ) : (
          <p style={styles.empty}>Loading...</p>
        )}
      </div>

    </div>
  );
};

const styles = {
  page: {
    padding: "50px 20px",
    background: "#f9f9f9",
    minHeight: "100vh",
    textAlign: "center" as const,
  },

  title: {
    fontSize: "36px",
    marginBottom: "30px",
    color: "#222",
  },

  card: {
    background: "#fff",
    padding: "30px",
    margin: "20px auto",
    maxWidth: "800px",
    borderRadius: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    borderTop: "6px solid #D4AF37",
  },

  cardTitle: {
    marginBottom: "20px",
    fontSize: "20px",
    color: "#333",
  },

  offerList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },

  offerItem: {
    padding: "12px",
    background: "#fafafa",
    borderRadius: "8px",
    border: "1px solid #eee",
  },

  statsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap" as const,
  },

  statBox: {
    background: "#fafafa",
    padding: "20px",
    borderRadius: "10px",
    width: "220px",
    border: "1px solid #eee",
  },

  statLabel: {
    fontSize: "14px",
    color: "#777",
  },

  statValue: {
    color: "#D4AF37",
    marginTop: "5px",
  },

  goldText: {
    color: "#D4AF37",
    fontWeight: "bold",
  },

  empty: {
    marginTop: "15px",
    color: "gray",
  },

  loading: {
    padding: "40px",
    textAlign: "center" as const,
  },
};

export default Offers;