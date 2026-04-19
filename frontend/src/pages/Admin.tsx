import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Admin = () => {

  const [form, setForm] = useState({
    name: "",
    price: "",
    weight: "",
    purity: "",
    makingCharges: "",
    gst: "",
    image: "",
  });

  const [products, setProducts] = useState<any[]>([]);
  const [goldRate, setGoldRate] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  // ✅ FETCH PRODUCTS
  const fetchProducts = () => {
    axios.get("http://localhost:5000/api/products")
      .then(res => setProducts(res.data || []))
      .catch(() => setProducts([]));
  };

  // ✅ LOAD DATA
  useEffect(() => {
    fetchProducts();

    axios.get("http://localhost:5000/api/goldrate")
      .then(res => setGoldRate(res.data?.ratePerGram || ""))
      .catch(() => setGoldRate(""));
  }, []);

  // ✅ INPUT CHANGE
  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ ADD / UPDATE
  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/products/${editId}`, form);
        alert("✏️ Product Updated");
      } else {
        await axios.post("http://localhost:5000/api/products", form);
        alert("✅ Product Added");
      }

      fetchProducts();
      setEditId(null);

      setForm({
        name: "",
        price: "",
        weight: "",
        purity: "",
        makingCharges: "",
        gst: "",
        image: "",
      });

    } catch {
      alert("❌ Error saving product");
    }
  };

  // ✅ EDIT
  const handleEdit = (p: any) => {
    setForm(p);
    setEditId(p._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ DELETE
  const deleteProduct = async (id: string) => {
    await axios.delete(`http://localhost:5000/api/products/${id}`);
    fetchProducts();
  };

  // ✅ GOLD RATE
  const updateGoldRate = async () => {
    await axios.post("http://localhost:5000/api/goldrate", {
      ratePerGram: goldRate
    });
    alert("Gold Rate Updated");
  };

  return (
  <div style={styles.container}>

  <h1 style={styles.heading}>⚙️ Admin Dashboard</h1>

  {/* 🛍 FULL WIDTH PRODUCT FORM */}
  <div style={styles.fullWidthCard}>
    <h3 style={styles.cardTitle}>
      {editId ? "✏️ Update Product" : "🛍 Add Product"}
    </h3>

    <div style={styles.formGrid}>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" style={styles.input} />
      <input name="price" value={form.price} onChange={handleChange} placeholder="Price" style={styles.input} />
      <input name="weight" value={form.weight} onChange={handleChange} placeholder="Weight" style={styles.input} />
      <input name="purity" value={form.purity} onChange={handleChange} placeholder="Purity" style={styles.input} />
      <input name="makingCharges" value={form.makingCharges} onChange={handleChange} placeholder="Making Charges" style={styles.input} />
      <input name="gst" value={form.gst} onChange={handleChange} placeholder="GST %" style={styles.input} />
    </div>

    <input
      name="image"
      value={form.image}
      onChange={handleChange}
      placeholder="Image URL"
      style={styles.input}
    />

    <button style={styles.primaryBtn} onClick={handleSubmit}>
      {editId ? "Update Product" : "Add Product"}
    </button>
  </div>

  {/* 💰 GOLD RATE + 📦 ORDERS SIDE BY SIDE */}
  <div style={styles.bottomGrid}>

    {/* GOLD RATE */}
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>💰 Gold Rate</h3>

      <input
        style={styles.input}
        value={goldRate}
        onChange={(e) => setGoldRate(e.target.value)}
        placeholder="Enter rate"
      />

      <button style={styles.primaryBtn} onClick={updateGoldRate}>
        Update
      </button>
    </div>

    {/* ORDERS */}
    <Link to="/admin/orders" style={styles.cardLink}>
      📦 Manage Orders →
    </Link>

  </div>

  {/* PRODUCTS */}
  <h2 style={styles.sectionTitle}>All Products</h2>

  <div style={styles.productGrid}>
    {products.map(p => (
      <div key={p._id} style={styles.productCard}>
        <img src={p.image} style={styles.image} />

        <h4>{p.name}</h4>
        <p style={styles.meta}>{p.weight}</p>

        <button style={styles.editBtn} onClick={() => handleEdit(p)}>
          Edit
        </button>

        <button style={styles.deleteBtn} onClick={() => deleteProduct(p._id)}>
          Delete
        </button>
      </div>
    ))}
  </div>

</div>
);
};

const styles = {
  container: {
    padding: "40px",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8f9fa, #eef2f7)",
  },

  heading: {
    textAlign: "center",
    fontSize: "36px",
    marginBottom: "40px",
    fontWeight: "700",
    color: "#2c3e50",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "25px",
    marginBottom: "40px",
  },

  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  cardLink: {
    textDecoration: "none",
    fontWeight: "bold",
    background: "#fff",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    color: "#3498db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#D4AF37",
  },

  row: {
    display: "flex",
    gap: "10px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
  },

  primaryBtn: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #D4AF37, #f1c40f)",
    fontWeight: "bold",
    cursor: "pointer",
  },

  sectionTitle: {
    fontSize: "22px",
    marginBottom: "20px",
    color: "#2c3e50",
  },

  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },

  productCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "15px",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },

  image: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    borderRadius: "10px",
    marginBottom: "10px",
  },

  meta: {
    fontSize: "13px",
    color: "#777",
  },

  editBtn: {
    marginTop: "10px",
    padding: "8px",
    width: "100%",
    borderRadius: "6px",
    border: "none",
    background: "#3498db",
    color: "#fff",
    cursor: "pointer",
  },

  deleteBtn: {
    marginTop: "5px",
    padding: "8px",
    width: "100%",
    borderRadius: "6px",
    border: "none",
    background: "#e74c3c",
    color: "#fff",
    cursor: "pointer",
  },

  fullWidthCard: {
  background: "#fff",
  padding: "30px",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  marginBottom: "30px",
},

bottomGrid: {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "25px",
  marginBottom: "40px",
},
};

export default Admin;