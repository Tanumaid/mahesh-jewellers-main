import { useEffect, useState } from "react";
import axios from "axios";

const AdminGoldRatePage = () => {
  const [rates, setRates] = useState({
    "24K": "",
    "22K": "",
    "18K": "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Fetch existing rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/goldrate");

        if (res.data?.rates) {
          setRates({
            "24K": res.data.rates["24K"] || "",
            "22K": res.data.rates["22K"] || "",
            "18K": res.data.rates["18K"] || "",
          });
        }
      } catch (err) {
        console.log("Error fetching gold rates");
      }
    };

    fetchRates();
  }, []);

  // ✅ Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRates({
      ...rates,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Update rates
  const updateRates = async () => {
    if (!rates["24K"] || !rates["22K"] || !rates["18K"]) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await axios.put("http://localhost:5000/api/goldrate", {
        rates: {
          "24K": Number(rates["24K"]),
          "22K": Number(rates["22K"]),
          "18K": Number(rates["18K"]),
        },
      });

      alert("Gold rates updated successfully");
    } catch (err) {
      alert("Failed to update rates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>💰 Gold Rate Management</h1>

      <div style={styles.card}>
        <label>24K Gold (₹/gram)</label>
        <input
          name="24K"
          type="number"
          value={rates["24K"]}
          onChange={handleChange}
          style={styles.input}
        />

        <label>22K Gold (₹/gram)</label>
        <input
          name="22K"
          type="number"
          value={rates["22K"]}
          onChange={handleChange}
          style={styles.input}
        />

        <label>18K Gold (₹/gram)</label>
        <input
          name="18K"
          type="number"
          value={rates["18K"]}
          onChange={handleChange}
          style={styles.input}
        />

        <button style={styles.btn} onClick={updateRates} disabled={loading}>
          {loading ? "Updating..." : "Update Rates"}
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
    marginBottom: "30px",
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
    gap: "10px",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },

  btn: {
    marginTop: "10px",
    padding: "12px",
    background: "#D4AF37",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default AdminGoldRatePage;