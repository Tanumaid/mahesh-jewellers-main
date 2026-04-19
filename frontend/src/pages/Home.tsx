import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import type { Product } from "../types/Product";

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const { addToCart } = useContext(CartContext)!;

  const [goldRate, setGoldRate] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    // 🔥 Fetch gold rate
    axios.get("http://localhost:5000/api/goldrate")
      .then((res) => {
        setGoldRate(res.data?.ratePerGram || 0);
      })
      .catch(() => setGoldRate(0));

    // 🔥 Fetch products
    axios.get("http://localhost:5000/api/products")
      .then((res) => {
        setProducts(res.data);
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));

  }, []);

  const goldPerTola = goldRate * 10;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // 🔥 Price calculation
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

  return (
    <div style={styles.container}>

      <h1>Welcome to Mahesh Jewellers 💎</h1>

      {user && <h3>Hello, {user.name}</h3>}

      {/* 🔥 GOLD RATE */}
      <div style={styles.goldBox}>
        <h3>Today's Gold Rate</h3>

        {goldRate ? (
          <>
            <p style={styles.rateText}>
              ₹ <span style={styles.highlight}>{goldRate}</span> / gram
            </p>

            <p style={styles.rateText}>
              ₹ <span style={styles.highlight}>{goldPerTola}</span> / tola (10g)
            </p>
          </>
        ) : (
          <p>Loading gold rate...</p>
        )}
      </div>

      <p>Explore beautiful jewellery collections!</p>

      <div style={styles.buttons}>
        {user && (
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>

      {/* 🔥 PRODUCTS SECTION */}
      <h2 style={{ marginTop: "40px" }}>Our Products</h2>

      {loadingProducts ? (
        <p>Loading products...</p>
      ) : (
        <div style={styles.grid}>
          {products.map((product) => (
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
      )}

    </div>
  );
};

const styles = {
  container: {
    textAlign: "center" as const,
    marginTop: "80px",
  },

  goldBox: {
    background: "#fff",
    padding: "25px",
    margin: "25px auto",
    width: "320px",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
    borderTop: "5px solid #D4AF37",
  },

  rateText: {
    fontSize: "16px",
    margin: "8px 0",
    color: "#444",
  },

  highlight: {
    color: "#D4AF37",
    fontWeight: "bold",
    fontSize: "18px",
  },

  buttons: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  },

  logoutBtn: {
    padding: "10px 20px",
    backgroundColor: "red",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "20px",
    padding: "20px",
  },

  card: {
    border: "1px solid #ddd",
    padding: "15px",
    textAlign: "center" as const,
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },

  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover" as const,
    cursor: "pointer",
    borderRadius: "8px",
  },

  price: {
    color: "#D4AF37",
    fontWeight: "bold",
  },

  btn: {
    marginTop: "10px",
    padding: "8px 15px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default Home;