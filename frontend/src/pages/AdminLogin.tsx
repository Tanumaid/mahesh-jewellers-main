import { useState } from "react";
import axios from "axios";

const AdminLogin = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Enter email & password");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/admin-login",
        { email, password }
      );

      localStorage.setItem("user", JSON.stringify(res.data));

      alert("Admin Login Success ✅");

      window.location.replace("/admin");

    } catch (err) {
      console.log(err);
      alert("Invalid admin credentials ❌");
    }
  };

  return (
    <div style={styles.container}>
      <h2>🔐 Admin Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />

      <button style={styles.btn} onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

const styles = {
  container: {
    marginTop: "100px",
    textAlign: "center"
  },
  input: {
    display: "block",
    margin: "10px auto",
    padding: "10px",
    width: "250px"
  },
  btn: {
    padding: "10px",
    background: "black",
    color: "white",
    marginTop: "10px",
    cursor: "pointer"
  }
};

export default AdminLogin;