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

import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import Wishlist from "./pages/Wishlist";
import Offers from "./pages/Offers";

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

function App() {

  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <Router>

      {!window.location.pathname.startsWith("/admin") && <Navbar />}

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

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="manage" element={<Admin />} />

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

          {/* ✅ ADD THIS */}
          <Route path="manage" element={<Admin />} />

        </Route>

        {/* 🎉 Order Success */}
        <Route path="/order-success" element={<OrderSuccess />} />

      </Routes>

      {/* ✅ Footer */}
      <Footer />

    </Router>
  );
}

export default App;