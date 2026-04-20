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
    setError(""); // clear error while typing
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    if (!emailRegex.test(user.email)) {
      return "Invalid email format";
    }

    if (user.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (user.aadhaar.length !== 12) {
      return "Aadhaar must be 12 digits";
    }

    if (user.mobile.length !== 10) {
      return "Mobile must be 10 digits";
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

      await axios.post("http://localhost:5000/api/users/register", user);

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

        <input name="name" placeholder="Full Name" value={user.name} onChange={handleChange} style={styles.input} />

        <input name="email" placeholder="Email" value={user.email} onChange={handleChange} style={styles.input} />

        <input type="password" name="password" placeholder="Password" value={user.password} onChange={handleChange} style={styles.input} />

        <input name="address" placeholder="Address" value={user.address} onChange={handleChange} style={styles.input} />

        <input name="aadhaar" placeholder="Aadhaar Number" value={user.aadhaar} onChange={handleChange} style={styles.input} />

        <input name="mobile" placeholder="Mobile Number" value={user.mobile} onChange={handleChange} style={styles.input} />

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