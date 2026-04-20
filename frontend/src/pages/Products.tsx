import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import type { Product } from "../types/Product";
import CategoryFilter from "../components/CategoryFilter";
import SubcategoryFilter from "../components/SubcategoryFilter";

const categoriesData: Record<string, string[]> = {
  "Gold": ["Ring", "Bangles", "Mangalsutra", "Chain", "Necklace"],
  "Silver": ["Anklet", "Jodvi", "Chain", "Ring"],
  "Temple Jewellery": ["Necklace", "Earrings", "Sets"]
};

const Products = () => {

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [goldRates, setGoldRates] = useState<any>({});
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
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const productRes = await axios.get(url);
        const goldRes = await axios.get("http://localhost:5000/api/goldrate");

        setProducts(productRes.data || []);
        setGoldRates(goldRes.data?.rates || {});
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, selectedSubcategory]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(""); // Reset subcategory when category changes
  };

  const calculatePrice = (product: Product) => {
    const weight = parseFloat(product.weight || "0");
    const making = parseFloat(product.makingCharges || "0");
    const purity = product.purity || "22K";

    const rate = goldRates[purity] || 0;

    const goldPrice = weight * rate;

    const goldGST = goldPrice * 0.03;
    const makingGST = making * 0.05;

    return (goldPrice + making + goldGST + makingGST).toFixed(2);
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

            {/* Stock Status */}
            {product.stockStatus && (
              <p style={{ 
                fontWeight: "bold", 
                marginTop: "5px", 
                color: product.stockStatus === "In Stock" ? "#27ae60" : 
                       product.stockStatus === "Out of Stock" ? "#e74c3c" : "#e67e22" 
              }}>
                {product.stockStatus}
              </p>
            )}

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
                  price: calculatePrice(product),
                  image: product.image,
                  quantity: 1,
                  weight: product.weight || "0", // ⭐ FIX
                });

                alert("Added to Cart ✅");
              }}
            >
              {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
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