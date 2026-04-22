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

  // ✅ GOLD + SILVER STATES
  const [goldRates, setGoldRates] = useState<any>({});
  const [silverRates, setSilverRates] = useState<any>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    // 🔥 GOLD
    axios.get("http://localhost:5000/api/goldrate")
      .then((res) => setGoldRates(res.data?.rates || {}))
      .catch(() => setGoldRates({}));

    // 🔥 SILVER
    axios.get("http://localhost:5000/api/silverrate")
      .then((res) => setSilverRates(res.data?.rates || {}))
      .catch(() => setSilverRates({}));

    // 🔥 PRODUCTS
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

  return (
    <div style={styles.container}>

      <HomeCarousel />

      <h1 style={{ marginTop: "40px" }}>Welcome to Mahesh Jewellers 💎</h1>
      {user && <h3>Hello, {user.name}</h3>}

      {/* ✅ GOLD + SILVER SIDE BY SIDE */}
      <div style={styles.rateContainer}>

        {/* GOLD */}
        <div style={styles.goldBox}>
          <h3>Today's Gold Rates</h3>

          {goldRates["24K"] ? (
            <>
              <p>24K: ₹ {goldRates["24K"]} / g</p>
              <p>22K: ₹ {goldRates["22K"]} / g</p>
              <p>18K: ₹ {goldRates["18K"]} / g</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        {/* SILVER */}
        <div style={styles.silverBox}>
          <h3>Today's Silver Rates</h3>

          {silverRates["999"] ? (
            <>
              <p>999: ₹ {silverRates["999"]} / g</p>
              <p>925: ₹ {silverRates["925"]} / g</p>
              <p>800: ₹ {silverRates["800"]} / g</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>

      </div>

      <p>Explore beautiful jewellery collections!</p>

      {user && (
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      )}

      {/* PRODUCTS */}
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

              <p style={styles.price}>
                ₹{formatPrice(
                  calculateFinalPrice(product, goldRates, silverRates) // ✅ UPDATED
                )}
              </p>

              <button
                style={styles.btn}
                onClick={() => {
                  addToCart({
                    id: product._id,
                    name: product.name,
                    price: calculateFinalPrice(product, goldRates, silverRates), // ✅ UPDATED
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
  },

  rateContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap" as const,
    marginTop: "20px",
  },

  goldBox: {
    background: "#fff",
    padding: "20px",
    width: "260px",
    borderRadius: "12px",
    borderTop: "5px solid #D4AF37",
  },

  silverBox: {
    background: "#fff",
    padding: "20px",
    width: "260px",
    borderRadius: "12px",
    borderTop: "5px solid #C0C0C0",
  },

  logoutBtn: {
    marginTop: "20px",
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
    borderRadius: "10px",
  },

  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover" as const,
    cursor: "pointer",
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