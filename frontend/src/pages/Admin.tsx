import { useState, useEffect } from "react";
import axios from "axios";

const Admin = () => {

  const [form, setForm] = useState({
    name: "",
    price: "",
    weight: "",
    purity: "",
    makingCharges: "",
    gst: "",
    image: "",
    category: "",
    subcategory: "",
    quantity: "",
  });

  const categoriesData: Record<string, string[]> = {
    "Gold": ["Ring", "Bangles", "Mangalsutra", "Chain", "Necklace"],
    "Silver": ["Anklet", "Jodvi", "Chain", "Ring"],
    "Temple Jewellery": ["Necklace", "Earrings", "Sets"]
  };

  const [products, setProducts] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchProducts = () => {
    axios.get("http://localhost:5000/api/products")
      .then(res => setProducts(res.data || []))
      .catch(() => setProducts([]));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {

    // ✅ VALIDATION
    if (!form.name || !form.weight || !form.purity || !form.makingCharges || !form.gst || !form.category || !form.subcategory || form.quantity === "") {
      alert("Please fill all required fields, including quantity, category, and subcategory.");
      return;
    }

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
        category: "",
        subcategory: "",
        quantity: "",
      });

    } catch {
      alert("❌ Error saving product");
    }
  };

  const handleEdit = (p: any) => {
    setForm(p);
    setEditId(p._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id: string) => {
    await axios.delete(`http://localhost:5000/api/products/${id}`);
    fetchProducts();
  };

  return (
    <div style={styles.container}>

      <h1 style={styles.heading}>⚙️ Admin Dashboard</h1>

      {/* 📊 DASHBOARD METRICS */}
      <div style={styles.dashboardGrid}>
        <div style={styles.metricCard}>
          <h3>Total Products</h3>
          <p style={styles.metricValue}>{products.length}</p>
        </div>
        <div style={styles.metricCard}>
          <h3>Out of Stock</h3>
          <p style={{ ...styles.metricValue, color: "#e74c3c" }}>
            {products.filter((p) => p.quantity === 0).length}
          </p>
        </div>
        <div style={styles.metricCard}>
          <h3>Low Stock</h3>
          <p style={{ ...styles.metricValue, color: "#e67e22" }}>
            {products.filter((p) => p.lowStock).length}
          </p>
        </div>
      </div>

      {/* 🛍 PRODUCT FORM */}
      <div style={styles.fullWidthCard}>
        <h3 style={styles.cardTitle}>
          {editId ? "✏️ Update Product" : "🛍 Add Product"}
        </h3>

        <div style={styles.formGrid}>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" style={styles.input} />

          {/* ❌ DISABLED PRICE */}
          <input
            name="price"
            value={form.price}
            placeholder="Auto Calculated"
            style={{ ...styles.input, background: "#eee" }}
            disabled
          />

          <input name="weight" value={form.weight} onChange={handleChange} placeholder="Weight (grams)" style={styles.input} />

          {/* ✅ PURITY DROPDOWN */}
          <select name="purity" value={form.purity} onChange={handleChange} style={styles.input}>
            <option value="">Select Purity</option>
            <option value="24K">24K</option>
            <option value="22K">22K</option>
            <option value="18K">18K</option>
          </select>

          {/* ✅ CATEGORY DROPDOWN */}
          <select name="category" value={form.category} onChange={(e) => setForm({...form, category: e.target.value, subcategory: ""})} style={styles.input}>
            <option value="">Select Category</option>
            {Object.keys(categoriesData).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* ✅ SUBCATEGORY DROPDOWN */}
          <select name="subcategory" value={form.subcategory} onChange={handleChange} style={styles.input} disabled={!form.category}>
            <option value="">Select Subcategory</option>
            {form.category && categoriesData[form.category]?.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          
          <input name="makingCharges" value={form.makingCharges} onChange={handleChange} placeholder="Making Charges ₹" style={styles.input} />

          <input name="gst" value={form.gst} onChange={handleChange} placeholder="GST %" style={styles.input} />

          <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="Quantity" style={styles.input} />
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

      {/* 🛍 PRODUCTS */}
      <h2 style={styles.sectionTitle}>All Products</h2>

      <div style={styles.productGrid}>
        {products.map(p => (
          <div key={p._id} style={styles.productCard}>
            <img src={p.image} style={styles.image} />

            <h4>{p.name}</h4>
            <p style={styles.meta}>{p.weight} g | {p.purity}</p>
            <p style={styles.meta}>{p.category} - {p.subcategory}</p>

            {/* Low Stock Warning */}
            {p.lowStock && (
              <p style={{ color: "#e74c3c", fontWeight: "bold", fontSize: "12px", marginTop: "5px" }}>
                {p.quantity === 0 ? "❌ Out of Stock" : "⚠️ Low Stock"}
              </p>
            )}
            {p.lowStock && p.soldCount >= 5 && (
              <p style={{ color: "#e67e22", fontWeight: "bold", fontSize: "12px" }}>
                ⚠️ Restock Recommended
              </p>
            )}

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

  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },

  metricCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    textAlign: "center" as const,
  },

  metricValue: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#2c3e50",
    margin: "10px 0 0",
  },

  heading: {
    textAlign: "center",
    fontSize: "36px",
    marginBottom: "40px",
    fontWeight: "700",
    color: "#2c3e50",
  },

  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#D4AF37",
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
    marginBottom: "10px",
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
};

export default Admin;