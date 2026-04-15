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
  });

  const [products, setProducts] = useState<any[]>([]);
  const [goldRate, setGoldRate] = useState("");

  // 🔥 Load products + gold rate
  useEffect(() => {
    fetchProducts();

    axios.get("http://localhost:5000/api/goldrate")
      .then(res => {
        setGoldRate(res.data?.ratePerGram || "");
      });
  }, []);

  const fetchProducts = () => {
    axios.get("http://localhost:5000/api/products")
      .then(res => setProducts(res.data));
  };

  // 🔥 Form change
  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 Add product
  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5000/api/products", form);

      alert("✅ Product Added");
      fetchProducts();

      setForm({
        name: "",
        price: "",
        weight: "",
        purity: "",
        makingCharges: "",
        gst: "",
        image: "",
      });

    } catch (error) {
      alert("❌ Error adding product");
    }
  };

  // 🔥 Delete product
  const deleteProduct = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      alert("Deleted ✅");
      fetchProducts();
    } catch {
      alert("Error deleting product");
    }
  };

  // 🔥 Update gold rate
  const updateGoldRate = async () => {
    try {
      await axios.post("http://localhost:5000/api/goldrate", {
        ratePerGram: goldRate
      });

      alert("Gold Rate Updated ✅");
    } catch {
      alert("Error updating gold rate");
    }
  };

  return (
    <div style={styles.container}>

      <h2>Admin Panel</h2>

      {/* 🔥 GOLD RATE */}
      <div style={styles.section}>
        <h3>Update Gold Rate</h3>
        <input
          placeholder="Rate per gram"
          value={goldRate}
          onChange={(e) => setGoldRate(e.target.value)}
        />
        <button onClick={updateGoldRate}>Update Rate</button>
      </div>

      {/* 🔥 ADD PRODUCT */}
      <div style={styles.section}>
        <h3>Add Product</h3>

        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} />
        <input name="price" placeholder="Price (optional)" value={form.price} onChange={handleChange} />
        <input name="weight" placeholder="Weight" value={form.weight} onChange={handleChange} />
        <input name="purity" placeholder="Purity" value={form.purity} onChange={handleChange} />
        <input name="makingCharges" placeholder="Making Charges" value={form.makingCharges} onChange={handleChange} />
        <input name="gst" placeholder="GST" value={form.gst} onChange={handleChange} />
        <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} />

        <button onClick={handleSubmit}>Add Product</button>
      </div>

      {/* 🔥 PRODUCT LIST */}
      <div style={styles.section}>
        <h3>All Products</h3>

        {products.map((p) => (
          <div key={p._id} style={styles.productRow}>
            <img src={p.image} style={styles.image} />

            <div style={{ flex: 1 }}>
              <h4>{p.name}</h4>
              <p>Weight: {p.weight}</p>
              <p>Making: {p.makingCharges}</p>
            </div>

            <button
              style={styles.deleteBtn}
              onClick={() => deleteProduct(p._id)}
            >
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
  },

  section: {
    marginBottom: "40px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    maxWidth: "400px",
  },

  productRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    borderBottom: "1px solid #ddd",
    padding: "10px 0",
  },

  image: {
    width: "60px",
    height: "60px",
    objectFit: "cover" as const,
  },

  deleteBtn: {
    backgroundColor: "red",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    cursor: "pointer",
  },
};

export default Admin;