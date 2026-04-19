import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    aadhaar: "",
    mobile: "",
  });

  const handleChange = (e: any) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();

    // 🔥 ADMIN LOGIN
    if (user.email === "admin@gmail.com" && user.password === "admin123") {
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: "Admin",
          email: "admin@gmail.com",
          isAdmin: true,
        })
      );

      alert("Admin Login Successful");
      navigate("/admin");
      return;
    }

    // 🔥 USER LOGIN (if already registered)
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/login",
        {
          email: user.email,
          password: user.password,
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...res.data,
          isAdmin: false,
        })
      );

      alert("Login Successful");
      navigate("/");
      return;
    } catch {
      // ❌ login failed → continue to register
    }

    // ✔ VALIDATION (only for new users)
    if (
      !user.name ||
      !user.email ||
      !user.password ||
      !user.address ||
      !user.aadhaar ||
      !user.mobile
    ) {
      alert("Please fill all fields");
      return;
    }

    if (user.aadhaar.length !== 12) {
      alert("Aadhaar must be 12 digits");
      return;
    }

    if (user.mobile.length !== 10) {
      alert("Mobile must be 10 digits");
      return;
    }

    try {
      // 🔥 REGISTER USER
      await axios.post("http://localhost:5000/api/users/register", user);

      // 🔥 AUTO LOGIN AFTER REGISTER
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: user.name,
          email: user.email,
          isAdmin: false,
        })
      );

      alert("Registration Successful");
      window.location.reload();
    } catch (error) {
      alert("Error registering user");
    }
  };

  return (
    <div style={styles.container}>
      <h2>User Registration / Login</h2>

      <form onSubmit={handleRegister} style={styles.form}>
        <input
          name="name"
          placeholder="Full Name"
          value={user.name}
          onChange={handleChange}
          style={styles.input}
        />

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

        <input
          name="address"
          placeholder="Address"
          value={user.address}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="aadhaar"
          placeholder="Aadhaar Number"
          value={user.aadhaar}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="mobile"
          placeholder="Mobile Number"
          value={user.mobile}
          onChange={handleChange}
          style={styles.input}
        />

        <button type="submit" style={styles.btn}>
          Continue
        </button>
      </form>

      <p style={{ marginTop: "10px", color: "gray" }}>
        Use same form for Login / Register
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    marginTop: "80px",
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
    borderRadius: "5px",
  },

  btn: {
    padding: "10px",
    backgroundColor: "#D4AF37",
    color: "#000",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    borderRadius: "5px",
  },
};

export default Register;