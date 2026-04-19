import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

import logo from "../assets/logo.png";

const Navbar = () => {

  const { cart } = useContext(CartContext)!;
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // 🔥 Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload(); // ✅ FIXED
  };

  return (
    <nav style={styles.nav}>

      {/* 🔹 Logo */}
      <div style={styles.logoBox}>
        <img src={logo} alt="Logo" style={styles.logoImg} />
        <span style={styles.logoText}>Mahesh Jewellers</span>
      </div>

      {/* 🔹 Menu */}
      <ul style={styles.menu}>

        <li><Link to="/">Home</Link></li>
        <li><Link to="/products">Products</Link></li>

        <li>
          <Link to="/cart">
            Cart ({cart.length})
          </Link>
        </li>

        {/* 🔥 Show only if logged in */}
        {user && (
          <>
            <li><Link to="/orders">My Orders</Link></li>
            <li><Link to="/offers">Offers</Link></li>

            {/* 🔥 Admin only (UPDATED) */}
            {user?.isAdmin && (
              <li>
                <Link to="/admin" onClick={() => console.log("Admin Clicked")}>
                  Admin
                </Link>
              </li>
            )}
            <li style={styles.userName}>👤 {user.name}</li>

            <li>
              <button style={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        )}

        {/* 🔥 If NOT logged in */}
        {!user && (
          <>
            {!user && (
              <>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Login</Link></li>
              </>
            )}
          </>
        )}

      </ul>

    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 40px",
    backgroundColor: "#000",
    flexWrap: "wrap" as const,
  },

  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  logoImg: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
  },

  logoText: {
    color: "#D4AF37",
    fontSize: "22px",
    fontWeight: "700",
  },

  menu: {
    display: "flex",
    listStyle: "none",
    gap: "20px",
    alignItems: "center",
    color: "white",
    flexWrap: "wrap" as const,
  },

  logoutBtn: {
    backgroundColor: "red",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: "5px",
  },

  userName: {
    color: "#D4AF37",
    fontWeight: "bold",
  },
};

export default Navbar;