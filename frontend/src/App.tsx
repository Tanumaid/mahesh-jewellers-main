import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import Wishlist from "./pages/Wishlist";

function App() {

  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <Router>

      {/* ✅ Navbar */}
      <Navbar />

      {/* ✅ Routes */}
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />

        {/* 🔥 Product Details */}
        <Route path="/product/:id" element={<ProductDetails />} />

        <Route path="/cart" element={<Cart />} />

        {/* 🔐 Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔥 Protected Routes */}
        <Route
          path="/orders"
          element={user ? <Orders /> : <Navigate to="/login" />}
        />

        <Route
          path="/wishlist"
          element={user ? <Wishlist /> : <Navigate to="/login" />}
        />

        {/* 🔥 Admin Protected */}
        <Route
          path="/admin"
          element={
            user?.email === "admin@gmail.com"
              ? <Admin />
              : <Navigate to="/" />
          }
        />

        {/* 🔥 Order Success */}
        <Route path="/order-success" element={<OrderSuccess />} />

      </Routes>

      {/* ✅ Footer */}
      <Footer />

    </Router>
  );
}

export default App;