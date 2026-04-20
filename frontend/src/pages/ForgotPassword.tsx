import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ VALIDATION
  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !newPassword) {
      return "Please fill all fields";
    }

    if (!emailRegex.test(email)) {
      return "Invalid email format";
    }

    if (newPassword.length < 6) {
      return "Password must be at least 6 characters";
    }

    return "";
  };

  const handleReset = async () => {
    setMessage("");
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/users/reset-password",
        {
          email: email.toLowerCase(), // ✅ IMPORTANT FIX
          newPassword,
        }
      );

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Forgot Password</h2>

      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}

      <input
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={styles.input}
      />

      <button
        style={styles.btn}
        onClick={handleReset}
        disabled={loading}
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center" as const,
    marginTop: "100px",
  },

  input: {
    display: "block",
    margin: "10px auto",
    padding: "10px",
    width: "250px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },

  btn: {
    padding: "10px 20px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },

  error: {
    color: "red",
    fontSize: "14px",
  },

  success: {
    color: "green",
    fontSize: "14px",
  },
};

export default ForgotPassword;