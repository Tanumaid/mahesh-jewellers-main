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

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setError("");
  };

  // ✅ VALIDATION
  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-z\s]+$/;

    if (
      !user.name ||
      !user.email ||
      !user.password ||
      !user.address ||
      !user.aadhaar ||
      !user.mobile
    ) {
      return "Please fill all fields";
    }

    // 🔤 NAME VALIDATION
    if (!nameRegex.test(user.name)) {
      return "Name should contain only letters";
    }

    if (user.name.length < 3) {
      return "Name must be at least 3 characters";
    }

    // 📧 EMAIL
    if (!emailRegex.test(user.email)) {
      return "Invalid email format";
    }

    // 🔐 PASSWORD
    if (user.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    // 🆔 AADHAAR (ONLY DIGITS)
    if (!/^\d{12}$/.test(user.aadhaar)) {
      return "Aadhaar must be exactly 12 digits";
    }

    // 📱 MOBILE (ONLY DIGITS)
    if (!/^\d{10}$/.test(user.mobile)) {
      return "Mobile must be exactly 10 digits";
    }

    return "";
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/users/register", {
        ...user,
        email: user.email.toLowerCase(), // ✅ normalize
      });

      alert("Registration Successful ✅");

      navigate("/login");

    } catch (error: any) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>User Registration</h2>

      <form onSubmit={handleRegister} style={styles.form}>

        {error && <p style={styles.error}>{error}</p>}

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

        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

      </form>

      <p style={{ marginTop: "10px" }}>
        Already have an account?
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => navigate("/login")}
        >
          Login
        </span>
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
    backgroundColor: "#D4AF37",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },

  error: {
    color: "red",
    fontSize: "14px",
    textAlign: "center" as const,
  },
};

export default Register;