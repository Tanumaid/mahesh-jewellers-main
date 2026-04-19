import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import type { Product } from "../types/Product";

const Products = () => {

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [goldRate, setGoldRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useContext(CartContext)!;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await axios.get("http://localhost:5000/api/products");
        const goldRes = await axios.get("http://localhost:5000/api/goldrate");

        setProducts(productRes.data || []);
        setGoldRate(goldRes.data?.ratePerGram || 0);
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculatePrice = (product: Product) => {
    if (!goldRate) return product.price || "0";

    const weight = parseFloat(product.weight || "0");
    const making = parseFloat(product.makingCharges || "0");
    const gst = parseFloat(product.gst || "0");

    const base = weight * goldRate;
    const total = base + making;
    const final = total + (total * gst / 100);

    return final.toFixed(2);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <h2 style={styles.center}>Loading products...</h2>;
  if (error) return <h2 style={styles.center}>{error}</h2>;

  return (
    <div style={styles.container}>
      <h2>All Products</h2>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      <div style={styles.grid}>
        {filteredProducts.map((product) => (
          <div key={product._id} style={styles.card}>

            <img
              src={product.image}
              style={styles.image}
              alt={product.name}
              onClick={() => navigate(`/product/${product._id}`)}
            />

            <h3>{product.name}</h3>

            <p style={styles.price}>₹{calculatePrice(product)}</p>

            <button
              style={styles.btn}
              onClick={() => {
                addToCart({
                  id: product._id,
                  name: product.name,
                  price: calculatePrice(product),
                  image: product.image,
                  quantity: 1,
                  weight: product.weight || "0", // ⭐ FIX
                });

                alert("Added to Cart ✅");
              }}
            >
              Add to Cart
            </button>

          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "40px", textAlign: "center" as const },
  center: { padding: "40px", textAlign: "center" as const },
  search: { width: "300px", padding: "10px", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "5px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" },
  card: { border: "1px solid #ddd", padding: "15px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  image: { width: "100%", height: "200px", objectFit: "cover" as const, cursor: "pointer", borderRadius: "8px" },
  price: { color: "#D4AF37", fontWeight: "bold" },
  btn: { marginTop: "10px", padding: "8px 15px", backgroundColor: "#000", color: "#fff", border: "none", cursor: "pointer", borderRadius: "5px" },
};

export default Products;