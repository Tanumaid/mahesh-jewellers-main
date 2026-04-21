import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import type { Product } from "../types/Product";
import HomeCarousel from "../components/HomeCarousel";
import { calculateFinalPrice, formatPrice } from "../utils/priceCalculator";

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const { addToCart } = useContext(CartContext)!;

  // ✅ MULTI CARAT RATES
  const [goldRates, setGoldRates] = useState<any>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    // 🔥 Fetch gold rates
    axios.get("http://localhost:5000/api/goldrate")
      .then((res) => {
        setGoldRates(res.data?.rates || {});
      })
      .catch(() => setGoldRates({}));

    // 🔥 Fetch products
    axios.get(`http://localhost:5000/api/products?t=${Date.now()}`)
      .then((res) => {
        setProducts(res.data);
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));

  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // The local calculatePrice has been removed in favor of the centralized utility.

  return (
    <div style={styles.container}>
      
      {/* 🎠 CAROUSEL AT TOP */}
      <HomeCarousel />

      <h1 style={{ marginTop: "40px" }}>Welcome to Mahesh Jewellers 💎</h1>

      {user && <h3>Hello, {user.name}</h3>}

      {/* ✅ GOLD RATES DISPLAY */}
      <div style={styles.goldBox}>
        <h3>Today's Gold Rates</h3>

        {goldRates["24K"] ? (
          <>
            <p style={styles.rateText}>
              24K: ₹ <span style={styles.highlight}>{goldRates["24K"]}</span> / g
            </p>

            <p style={styles.rateText}>
              22K: ₹ <span style={styles.highlight}>{goldRates["22K"]}</span> / g
            </p>

            <p style={styles.rateText}>
              18K: ₹ <span style={styles.highlight}>{goldRates["18K"]}</span> / g
            </p>
          </>
        ) : (
          <p>Loading gold rates...</p>
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

              {/* ✅ DYNAMIC PRICE */}
              <p style={styles.price}>₹{formatPrice(calculateFinalPrice(product, goldRates))}</p>

              <button
                style={styles.btn}
                onClick={() => {
                  addToCart({
                    id: product._id,
                    name: product.name,
                    price: calculateFinalPrice(product, goldRates),
                    image: product.image,
                    quantity: 1,
                    weight: product.weight || "0",
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