import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

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
import ForgotPassword from "./pages/ForgotPassword";

import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import Wishlist from "./pages/Wishlist";
import Offers from "./pages/Offers";

// Admin
import Admin from "./pages/Admin";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import UsersAdmin from "./pages/admin/UsersAdmin";
import Analytics from "./pages/admin/Analytics";
import GoldRateAdmin from "./pages/admin/GoldRateAdmin";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import AdminRoute from "./components/AdminRoute";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";


// 🔥 Wrapper to use useLocation properly
const AppContent = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <>
      {/* ✅ FIXED NAVBAR CONDITION */}
      {!location.pathname.startsWith("/admin") && <Navbar />}

      <Routes>

        {/* 🌐 Public */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />

        {/* 🔐 Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/admin-login" element={<AdminLogin />} />

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

        {/* 🔥 Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="users" element={<UsersAdmin />} />
          <Route path="goldrate" element={<GoldRateAdmin />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="manage" element={<Admin />} />
        </Route>

        {/* 🎉 Order Success */}
        <Route path="/order-success" element={<OrderSuccess />} />

      </Routes>

      <Footer />
    </>
  );
};


function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;