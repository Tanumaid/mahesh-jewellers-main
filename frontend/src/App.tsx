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
import Offers from "./pages/Offers";

import ProductsAdmin from "./pages/admin/ProductsAdmin";
import UsersAdmin from "./pages/admin/UsersAdmin";
import Analytics from "./pages/admin/Analytics";
import GoldRateAdmin from "./pages/admin/GoldRateAdmin";
import OrdersAdmin from "./pages/admin/OrdersAdmin";

function App() {

  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <Router>

      {/* ✅ Navbar */}
      <Navbar />

      {/* ✅ Routes */}
      <Routes>

        {/* 🌐 Public */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />

        {/* 🔐 Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔒 User Protected */}
        <Route
          path="/orders"
          element={user ? <Orders /> : <Navigate to="/login" />}
        />

        <Route
          path="/wishlist"
          element={user ? <Wishlist /> : <Navigate to="/login" />}
        />

        <Route
          path="/offers"
          element={user ? <Offers /> : <Navigate to="/login" />}
        />

        {/* 🔥 Admin Main */}
        <Route
          path="/admin"
          element={user?.isAdmin ? <Admin /> : <Navigate to="/" />}
        />

        {/* ✅ FIXED ADMIN ROUTES (MOVED INSIDE) */}
        <Route
          path="/admin/products"
          element={user?.isAdmin ? <ProductsAdmin /> : <Navigate to="/" />}
        />

        <Route
          path="/admin/users"
          element={user?.isAdmin ? <UsersAdmin /> : <Navigate to="/" />}
        />

        <Route
          path="/admin/analytics"
          element={user?.isAdmin ? <Analytics /> : <Navigate to="/" />}
        />

        <Route
          path="/admin/goldrate"
          element={user?.isAdmin ? <GoldRateAdmin /> : <Navigate to="/" />}
        />

        <Route
          path="/admin/orders"
          element={user?.isAdmin ? <OrdersAdmin /> : <Navigate to="/" />}
        />

        {/* 🎉 Order Success */}
        <Route path="/order-success" element={<OrderSuccess />} />

      </Routes>

      {/* ✅ Footer */}
      <Footer />

    </Router>
  );
}

export default App;