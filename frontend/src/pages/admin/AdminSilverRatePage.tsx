import { useEffect, useState } from "react";
import axios from "axios";

const AdminSilverRatePage = () => {
  const [rates, setRates] = useState({
    "999": "",
    "925": "",
    "800": "", // ✅ NEW
  });

  const [loading, setLoading] = useState(false);

  // ✅ Fetch rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/silverrate");

        if (res.data?.rates) {
          setRates({
            "999": res.data.rates["999"] || "",
            "925": res.data.rates["925"] || "",
            "800": res.data.rates["800"] || "", // ✅ NEW
          });
        }
      } catch (err) {
        console.log("Error fetching silver rates");
      }
    };

    fetchRates();
  }, []);

  // ✅ Handle input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRates({
      ...rates,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Update rates
  const updateRates = async () => {
    if (!rates["999"] || !rates["925"] || !rates["800"]) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await axios.put("http://localhost:5000/api/silverrate", {
        rates: {
          "999": Number(rates["999"]),
          "925": Number(rates["925"]),
          "800": Number(rates["800"]), // ✅ NEW
        },
      });

      alert("Silver rates updated successfully ✅");
    } catch (err) {
      alert("Failed to update rates ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🥈 Silver Rate Management</h1>

      <div style={styles.card}>
        <label>999 Silver (₹/gram)</label>
        <input
          name="999"
          type="number"
          value={rates["999"]}
          onChange={handleChange}
          style={styles.input}
        />

        <label>925 Silver (₹/gram)</label>
        <input
          name="925"
          type="number"
          value={rates["925"]}
          onChange={handleChange}
          style={styles.input}
        />

        {/* ✅ NEW FIELD */}
        <label>800 Silver (₹/gram)</label>
        <input
          name="800"
          type="number"
          value={rates["800"]}
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
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)", // ✨ better UI
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  btn: {
    marginTop: "10px",
    padding: "12px",
    background: "#C0C0C0",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default AdminSilverRatePage;