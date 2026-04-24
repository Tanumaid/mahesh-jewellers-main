import { Link, useNavigate } from "react-router-dom";

const AdminNavbar = () => {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login"); // redirect to user login
    };

    return (
        <div style={styles.nav}>

            <h2 style={styles.logo}>⚙️ Admin Panel</h2>

            <div style={styles.links}>
                <Link to="">Dashboard</Link>
                {/* <Link to="products">Products</Link> */}
                <Link to="orders">Orders</Link>
                <Link to="pos">💳 POS Billing</Link>
                <Link to="users">Users</Link>
                <Link to="goldrate">Gold Rate</Link>
                <Link to="analytics">Analytics</Link>
                <Link to="manage">⚙️ Manage Shop</Link> ✅

                {/* 🔥 Logout Button */}
                <button style={styles.logoutBtn} onClick={handleLogout}>
                    Logout
                </button>
            </div>

        </div>
    );
};

const styles = {
    nav: {
        display: "flex",
        justifyContent: "space-between",
        padding: "15px 30px",
        background: "#000",
        color: "#fff",
        alignItems: "center"
    },

    links: {
        display: "flex",
        gap: "20px",
        alignItems: "center"
    },

    logo: {
        color: "#D4AF37",
    },

    logoutBtn: {
        background: "red",
        color: "#fff",
        border: "none",
        padding: "6px 12px",
        cursor: "pointer",
        borderRadius: "5px"
    }
};

export default AdminNavbar;