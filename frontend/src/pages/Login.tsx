import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: any) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();

    if (!user.email || !user.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/login",
        user
      );

      // ✔ save user
      localStorage.setItem("user", JSON.stringify(res.data.user || res.data));

      alert("Login successful");

      // ⭐ redirect to home
      navigate("/");
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>

      <form onSubmit={handleLogin} style={styles.form}>
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

        <button type="submit" style={styles.btn}>
          Login
        </button>
      </form>

      <p>
        Don't have an account? <Link to="/register">Register</Link>
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
    gap: "15px",
    marginTop: "20px",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
  },
  btn: {
    padding: "10px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default Login;