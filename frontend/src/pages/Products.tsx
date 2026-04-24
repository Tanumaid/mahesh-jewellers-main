import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import type { Product } from "../types/Product";
import CategoryFilter from "../components/CategoryFilter";
import SubcategoryFilter from "../components/SubcategoryFilter";
import GenderFilter from "../components/GenderFilter";
import { calculateFinalPrice, formatPrice } from "../utils/priceCalculator";

const Products = () => {

  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesData, setCategoriesData] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedGender, setSelectedGender] = useState("All");
  const [goldRates, setGoldRates] = useState<any>({});
  const [silverRates, setSilverRates] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useContext(CartContext)!;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = "http://localhost:5000/api/products";
        const params = new URLSearchParams();

        if (selectedCategory !== "All") params.append("category", selectedCategory);
        if (selectedSubcategory) params.append("subcategory", selectedSubcategory);
        if (selectedGender !== "All") params.append("gender", selectedGender);

        if (params.toString()) {
          url += `?${params.toString()}&t=${Date.now()}`;
        } else {
          url += `?t=${Date.now()}`;
        }

        const productRes = await axios.get(url);
        const goldRes = await axios.get("http://localhost:5000/api/goldrate");
        const silverRes = await axios.get("http://localhost:5000/api/silverrate").catch(() => ({ data: {} }));
        const categoryRes = await axios.get("http://localhost:5000/api/categories");

        setProducts(productRes.data || []);
        setGoldRates(goldRes.data?.rates || {});
        setSilverRates(silverRes.data?.rates || {});
        setCategoriesData(categoryRes.data || {});
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, selectedSubcategory, selectedGender]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory("");
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

      <CategoryFilter
        categories={["All", ...Object.keys(categoriesData)]}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      <GenderFilter
        selectedGender={selectedGender}
        onSelectGender={setSelectedGender}
      />

      {selectedCategory !== "All" && (
        <SubcategoryFilter
          subcategories={categoriesData[selectedCategory] || []}
          selectedSubcategory={selectedSubcategory}
          onSelectSubcategory={setSelectedSubcategory}
        />
      )}

      {filteredProducts.length === 0 && !loading && (
        <h3 style={{ color: "#777", marginTop: "20px" }}>No Products Found</h3>
      )}

      <div style={styles.grid}>
        {filteredProducts.map((product) => {

          // ✅ IMPORTANT FIX: calculate only when rates loaded
          const finalPrice =
            Object.keys(goldRates).length > 0 || Object.keys(silverRates).length > 0
              ? calculateFinalPrice(product, goldRates, silverRates)
              : "0.00";

          return (
            <div key={product._id} style={styles.card}>

              <img
                src={product.image}
                style={styles.image}
                alt={product.name}
                onClick={() => navigate(`/product/${product._id}`)}
              />

              {/* ✅ Gender Badge */}
              <div style={styles.genderBadge}>
                {(product.gender || "Women") === "Men" ? "🧔 Men" : "👩 Women"}
              </div>

              <h3>{product.name}</h3>

              {/* ✅ FIXED PRICE DISPLAY */}
              <p style={styles.price}>
                {finalPrice === "0.00" ? "Loading..." : `₹${formatPrice(finalPrice)}`}
              </p>

              {/* Stock Badges */}
              <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "15px" }}>
                {product.quantity === 0 && (
                  <span style={{ padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", color: "#fff", backgroundColor: "#e74c3c" }}>
                    Out of Stock
                  </span>
                )}

                {product.quantity === 1 && (
                  <span style={{ padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", color: "#fff", backgroundColor: "#e67e22" }}>
                    Only 1 left
                  </span>
                )}

                {(product.soldCount || 0) >= 5 && (
                  <span style={{ padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", backgroundColor: "#ffeb3b", color: "#d35400" }}>
                    🔥 Trending
                  </span>
                )}
              </div>

              <button
                style={{
                  ...styles.btn,
                  opacity: product.quantity === 0 ? 0.5 : 1,
                  cursor: product.quantity === 0 ? "not-allowed" : "pointer"
                }}
                disabled={product.quantity === 0}
                onClick={() => {

                  addToCart({
                    id: product._id,
                    name: product.name,
                    price: finalPrice, // ✅ FIXED
                    image: product.image,
                    quantity: 1,
                    weight: product.weight || "0",
                  });

                  alert("Added to Cart ✅");
                }}
              >
                {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
              </button>

            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "40px", textAlign: "center" as const },
  center: { padding: "40px", textAlign: "center" as const },
  search: { width: "300px", padding: "10px", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "5px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" },
  card: { border: "1px solid #ddd", padding: "15px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", position: "relative" as const },
  image: { width: "100%", height: "200px", objectFit: "cover" as const, cursor: "pointer", borderRadius: "8px" },
  price: { color: "#D4AF37", fontWeight: "bold" },
  btn: { marginTop: "10px", padding: "8px 15px", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "5px" },
  genderBadge: { position: "absolute" as const, top: "25px", right: "25px", backgroundColor: "rgba(0,0,0,0.7)", color: "white", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" },
};

export default Products;