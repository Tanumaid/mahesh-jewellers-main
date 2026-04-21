import { useEffect, useState } from "react";
import axios from "axios";

const ProductsAdmin = () => {

  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // 🔥 EDIT STATES
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    weight: "",
    image: ""
  });

  // 🔥 Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get(`http://localhost:5000/api/products?t=${Date.now()}`);
    setProducts(res.data);
  };

  // 🔥 DELETE
  const deleteProduct = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;

    await axios.delete(`http://localhost:5000/api/products/${id}`);
    fetchProducts();
  };

  // 🔥 EDIT CLICK
  const handleEdit = (p: any) => {
    setForm({
      name: p.name,
      price: p.price,
      weight: p.weight,
      image: p.image
    });

    setEditId(p._id);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔥 INPUT CHANGE
  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // 🔥 UPDATE PRODUCT
  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/products/${editId}`,
        form
      );

      alert("✏️ Product Updated");

      setEditId(null);
      setForm({
        name: "",
        price: "",
        weight: "",
        image: ""
      });

      fetchProducts();

    } catch {
      alert("❌ Update failed");
    }
  };

  // 🔍 SEARCH FILTER
  const filteredProducts = products.filter((p) =>
    `${p.name} ${p.weight}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>

      <h2 style={styles.sectionTitle}>All Products</h2>

      {/* 🔥 EDIT FORM (ONLY SHOW WHEN EDITING) */}
      {editId && (
        <div style={styles.editBox}>
          <h3>✏️ Edit Product</h3>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            style={styles.input}
          />

          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            style={styles.input}
          />

          <input
            name="weight"
            value={form.weight}
            onChange={handleChange}
            placeholder="Weight"
            style={styles.input}
          />

          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Image URL"
            style={styles.input}
          />

          <button style={styles.updateBtn} onClick={handleUpdate}>
            Update Product
          </button>
        </div>
      )}

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="🔍 Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.searchInput}
      />

      {/* 🛍 PRODUCTS */}
      <div style={styles.productGrid}>
        {filteredProducts.map((p) => (
          <div key={p._id} style={styles.productCard}>

            <img src={p.image} alt={p.name} style={styles.image} />

            <h4>{p.name}</h4>
            <p style={styles.meta}>{p.weight}</p>

            <div style={styles.btnGroup}>
              <button
                style={styles.editBtn}
                onClick={() => handleEdit(p)}
              >
                Edit
              </button>

              <button
                style={styles.deleteBtn}
                onClick={() => deleteProduct(p._id)}
              >
                Delete
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    background: "#f5f6fa",
  },

  sectionTitle: {
    marginBottom: "20px",
  },

  searchInput: {
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  editBox: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },

  input: {
    display: "block",
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
  },

  updateBtn: {
    background: "#27ae60",
    color: "#fff",
    padding: "10px",
    border: "none",
    cursor: "pointer",
  },

  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
  },

  productCard: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center" as const,
  },

  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover" as const,
  },

  meta: {
    fontSize: "13px",
    color: "#777",
  },

  btnGroup: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },

  editBtn: {
    background: "#3498db",
    color: "#fff",
    padding: "6px",
    border: "none",
  },

  deleteBtn: {
    background: "red",
    color: "#fff",
    padding: "6px",
    border: "none",
  },
};

export default ProductsAdmin;