import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../context/CartContext"; // ✅ IMPORTANT

const Login = () => {
  const navigate = useNavigate();

  const { updateUser } = useContext(CartContext)!; // ✅ GET FROM CONTEXT

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Redirect if already logged in
  useEffect(() => {
    const existingUser = localStorage.getItem("user");
    if (existingUser) {
      navigate("/");
    }
  }, []);

  const handleChange = (e: any) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setError("");
  };

  // ✅ VALIDATION
  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!user.email || !user.password) {
      return "Please fill all fields";
    }

    if (!emailRegex.test(user.email)) {
      return "Invalid email format";
    }

    return "";
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/users/login",
        user
      );

      // ✅ USE CONTEXT (MAIN FIX)
      updateUser(res.data);

      navigate("/");

    } catch (error: any) {
      setError(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>

      <form onSubmit={handleLogin} style={styles.form}>

        {error && <p style={styles.error}>{error}</p>}

        <input
          name="email"
          placeholder="Email"
          value={user.email}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={user.password}
          onChange={handleChange}
          style={styles.input}
        />

        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

      <p style={{ marginTop: "10px" }}>
        Don't have an account?
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => navigate("/register")}
        >
          Register here
        </span>
      </p>

      <p
        style={{ marginTop: "10px", color: "red", cursor: "pointer" }}
        onClick={() => navigate("/forgot-password")}
      >
        Forgot Password?
      </p>

      <p
        style={{ marginTop: "10px", color: "green", cursor: "pointer" }}
        onClick={() => navigate("/admin-login")}
      >
        Admin Login
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    marginTop: "100px",
  },

  form: {
    display: "flex",
    flexDirection: "column" as const,
    width: "300px",
    gap: "12px",
    marginTop: "20px",
  },

  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },

  btn: {
    padding: "10px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },

  error: {
    color: "red",
    fontSize: "14px",
    textAlign: "center" as const,
  },
};

export default Login;