import { useState, useEffect } from "react";
import axios from "axios";
import { calculateFinalPrice } from "../../utils/priceCalculator";

interface Product {
  _id: string;
  name: string;
  price?: string;
  weight: string;
  purity: string;
  makingCharges: string;
  category: string;
  subcategory: string;
  quantity: number;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  weight: number;
  quantity: number;
}

const POSAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [goldRates, setGoldRates] = useState<any>({});
  const [silverRates, setSilverRates] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // Customer Details
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");

  // Product Selection
  const [categoryFilter, setCategoryFilter] = useState("Gold");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Exchange
  const [enableExchange, setEnableExchange] = useState(false);
  const [exchangeMetal, setExchangeMetal] = useState("Gold");
  const [exchangeAmount, setExchangeAmount] = useState<number | "">("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, rateRes, silverRes] = await Promise.all([
        axios.get("http://localhost:5000/api/products"),
        axios.get("http://localhost:5000/api/goldrate"),
        axios.get("http://localhost:5000/api/silverrate").catch(() => ({ data: {} }))
      ]);
      setProducts(prodRes.data);
      if (rateRes.data && rateRes.data.length > 0) {
        setGoldRates(rateRes.data[0]);
      }
      if (silverRes.data && silverRes.data.rates) {
        setSilverRates(silverRes.data.rates);
      }
    } catch (err) {
      console.error("Error fetching POS data", err);
    }
  };

  const filteredProducts = products.filter(
    p => p.category === categoryFilter && p.quantity > 0
  );

  const selectedProduct = filteredProducts.find(p => p._id === selectedProductId);

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    const computedPrice = parseFloat(calculateFinalPrice(selectedProduct, goldRates, silverRates));
    const weightNum = parseFloat(selectedProduct.weight) || 0;

    console.log("=== PRICE DEBUG ===");
    console.log("Product selected:", selectedProduct.name);
    console.log("Computed finalPrice string:", calculateFinalPrice(selectedProduct, goldRates, silverRates));
    console.log("Parsed POS Price:", computedPrice);
    console.log("Rates used:", { goldRates, silverRates });
    
    const existingItem = cart.find(i => i.productId === selectedProduct._id);
    
    if (existingItem) {
      if (existingItem.quantity + selectedQuantity > selectedProduct.quantity) {
        alert("Not enough stock available.");
        return;
      }
      setCart(cart.map(i => 
        i.productId === selectedProduct._id 
          ? { ...i, quantity: i.quantity + selectedQuantity } 
          : i
      ));
    } else {
      if (selectedQuantity > selectedProduct.quantity) {
        alert("Not enough stock available.");
        return;
      }
      setCart([...cart, {
        productId: selectedProduct._id,
        name: selectedProduct.name,
        price: computedPrice,
        weight: weightNum,
        quantity: selectedQuantity
      }]);
    }
    
    setSelectedProductId("");
    setSelectedQuantity(1);
  };

  const removeFromCart = (pid: string) => {
    setCart(cart.filter(c => c.productId !== pid));
  };

  // Calculations
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const actualExchange = enableExchange ? (Number(exchangeAmount) || 0) : 0;
  const finalAmount = Math.max(0, totalAmount - actualExchange);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }
    if (!customerName || !mobile) {
      alert("Customer Name and Mobile are required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerName,
        mobile,
        address,
        items: cart,
        exchange: enableExchange ? {
          metal: exchangeMetal,
          amount: actualExchange
        } : null
      };

      const { data } = await axios.post("http://localhost:5000/api/orders/pos-order", payload);
      alert("POS Order Generated Successfully!");
      
      if (data.order && data.order.invoiceUrl) {
        window.open(data.order.invoiceUrl, "_blank");
      }

      // Reset Form
      setCart([]);
      setCustomerName("");
      setMobile("");
      setAddress("");
      setEnableExchange(false);
      setExchangeAmount("");
      fetchData(); // refresh stock
      
    } catch (err: any) {
      alert(err.response?.data?.message || "Error generating POS order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ color: "#D4AF37", marginBottom: "20px" }}>💳 POS Billing System</h2>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        
        {/* LEFT COLUMN: Input Forms */}
        <div>
          {/* CUSTOMER DETAILS */}
          <div style={styles.card}>
            <h3>1. Customer Details</h3>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Name</label>
                <input 
                  type="text" 
                  style={styles.input} 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  placeholder="Walk-in Customer"
                />
              </div>
              <div>
                <label style={styles.label}>Mobile</label>
                <input 
                  type="text" 
                  style={styles.input} 
                  value={mobile} 
                  onChange={(e) => setMobile(e.target.value)} 
                  placeholder="10-digit number"
                />
              </div>
            </div>
            <div style={{ marginTop: "10px" }}>
              <label style={styles.label}>Address</label>
              <textarea 
                style={{...styles.input, height: "60px"}} 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="Customer Address"
              />
            </div>
          </div>

          {/* PRODUCT SELECTION */}
          <div style={styles.card}>
            <h3>2. Add Products</h3>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Category</label>
                <select 
                  style={styles.input} 
                  value={categoryFilter} 
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setSelectedProductId("");
                  }}
                >
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Temple Jewellery">Temple Jewellery</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Select Product (In Stock Only)</label>
                <select 
                  style={styles.input} 
                  value={selectedProductId} 
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">-- Choose Product --</option>
                  {filteredProducts.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.weight}g) - Stock: {p.quantity}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedProduct && (
              <div style={{ marginTop: "15px", padding: "10px", background: "#f1f1f1", borderRadius: "5px" }}>
                <p><strong>Price:</strong> ₹{calculateFinalPrice(selectedProduct, goldRates, silverRates)}</p>
                <p><strong>Weight:</strong> {selectedProduct.weight}g</p>
                
                <div style={{ display: "flex", gap: "10px", marginTop: "10px", alignItems: "center" }}>
                  <label>Qty:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={selectedProduct.quantity}
                    style={{...styles.input, width: "80px", margin: 0}} 
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                  />
                  <button style={styles.addBtn} onClick={handleAddToCart}>
                    Add to Bill
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* OLD EXCHANGE */}
          <div style={styles.card}>
            <h3>3. Old Exchange (Optional)</h3>
            <label style={{ display: "flex", gap: "10px", alignItems: "center", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={enableExchange} 
                onChange={(e) => setEnableExchange(e.target.checked)} 
              />
              Enable Old Exchange
            </label>

            {enableExchange && (
              <div style={{ ...styles.grid2, marginTop: "15px" }}>
                <div>
                  <label style={styles.label}>Metal Type</label>
                  <select 
                    style={styles.input} 
                    value={exchangeMetal} 
                    onChange={(e) => setExchangeMetal(e.target.value)}
                  >
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Exchange Amount (₹)</label>
                  <input 
                    type="number" 
                    style={styles.input} 
                    value={exchangeAmount} 
                    onChange={(e) => setExchangeAmount(Number(e.target.value))} 
                    placeholder="Enter deducted amount"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Summary & Cart */}
        <div>
          <div style={{ ...styles.card, background: "#fcfcfc" }}>
            <h3>Cart Items ({cart.length})</h3>
            
            {cart.length === 0 ? (
              <p style={{ color: "#888" }}>No items added yet.</p>
            ) : (
              <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "20px" }}>
                {cart.map((item, idx) => (
                  <div key={idx} style={{ borderBottom: "1px solid #ddd", paddingBottom: "10px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong>{item.name}</strong>
                      <span onClick={() => removeFromCart(item.productId)} style={{ color: "red", cursor: "pointer" }}>✖</span>
                    </div>
                    <div style={{ fontSize: "14px", color: "#555", display: "flex", justifyContent: "space-between" }}>
                      <span>{item.weight}g x {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <hr style={{ margin: "20px 0" }} />

            <div style={{ fontSize: "16px" }}>
              <div style={styles.summaryRow}>
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              
              {enableExchange && (
                <div style={{ ...styles.summaryRow, color: "red" }}>
                  <span>Old Exchange:</span>
                  <span>- ₹{actualExchange.toFixed(2)}</span>
                </div>
              )}

              <hr style={{ margin: "10px 0" }} />

              <div style={{ ...styles.summaryRow, fontSize: "20px", fontWeight: "bold", color: "#27ae60" }}>
                <span>Final Payable:</span>
                <span>₹{finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button 
              style={{ ...styles.checkoutBtn, opacity: loading || cart.length === 0 ? 0.5 : 1 }} 
              disabled={loading || cart.length === 0}
              onClick={handleCheckout}
            >
              {loading ? "Processing..." : "Generate Bill & Complete Order"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    marginBottom: "20px"
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px"
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#333"
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxSizing: "border-box" as const
  },
  addBtn: {
    padding: "10px 20px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px"
  },
  checkoutBtn: {
    width: "100%",
    padding: "15px",
    background: "#D4AF37",
    color: "#000",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "20px"
  }
};

export default POSAdmin;
