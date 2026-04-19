import { useEffect, useState } from "react";
import axios from "axios";

const GoldRateAdmin = () => {
  const [rate, setRate] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/goldrate")
      .then((res) => setRate(res.data.ratePerGram));
  }, []);

  const updateRate = async () => {
    await axios.put("http://localhost:5000/api/goldrate", {
      ratePerGram: rate,
    });
    alert("Updated");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>💰 Gold Rate</h1>

      <div style={styles.card}>
        <input
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          style={styles.input}
        />

        <button style={styles.btn} onClick={updateRate}>
          Update Rate
        </button>
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
    marginBottom: "20px",
  },

  card: {
    maxWidth: "400px",
    margin: "auto",
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "15px",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },

  btn: {
    padding: "12px",
    background: "#D4AF37",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default GoldRateAdmin;