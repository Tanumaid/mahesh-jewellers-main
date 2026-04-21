import { useState, useRef } from "react";
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

  const [aadhaarFront, setAadhaarFront] = useState<File | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<File | null>(null);
  
  const [frontError, setFrontError] = useState("");
  const [backError, setBackError] = useState("");

  const [isAadhaarFocused, setIsAadhaarFocused] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: any) => {
    if (e.target.name === "aadhaar") {
      const val = e.target.value.replace(/\D/g, "").slice(0, 12); // Only digits, max 12
      setUser({ ...user, aadhaar: val });
    } else if (e.target.name === "mobile") {
      const val = e.target.value.replace(/\D/g, "").slice(0, 10); // Only digits, max 10
      setUser({ ...user, mobile: val });
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
    setError("");
  };

  const validateFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      return "File too large. Max 2MB allowed.";
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return "Invalid format. Only JPG, PNG, or PDF allowed.";
    }
    return null;
  };

  const handleFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFrontError("");
    
    const err = validateFile(file);
    if (err) {
      setFrontError(err);
      setAadhaarFront(null);
      if (frontInputRef.current) frontInputRef.current.value = "";
      return;
    }

    setAadhaarFront(file);
  };

  const handleBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackError("");
    
    const err = validateFile(file);
    if (err) {
      setBackError(err);
      setAadhaarBack(null);
      if (backInputRef.current) backInputRef.current.value = "";
      return;
    }

    setAadhaarBack(file);
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
      return "Please fill all text fields";
    }

    if (!aadhaarFront || !aadhaarBack) {
      return "Both Aadhaar Front and Back images are required";
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

    if (frontError || backError) {
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("email", user.email.toLowerCase());
      formData.append("password", user.password);
      formData.append("address", user.address);
      formData.append("aadhaar", user.aadhaar);
      formData.append("mobile", user.mobile);
      if (aadhaarFront) {
        formData.append("aadhaarFront", aadhaarFront);
      }
      if (aadhaarBack) {
        formData.append("aadhaarBack", aadhaarBack);
      }

      await axios.post("http://localhost:5000/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Registration Successful ✅");

      navigate("/login");

    } catch (error: any) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const displayAadhaar = isAadhaarFocused || user.aadhaar.length !== 12
    ? user.aadhaar
    : `XXXX-XXXX-${user.aadhaar.slice(8, 12)}`;

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

        <div style={styles.inputGroup}>
          <input
            name="aadhaar"
            placeholder="Aadhaar Number (12 digits)"
            value={displayAadhaar}
            onChange={handleChange}
            onFocus={() => setIsAadhaarFocused(true)}
            onBlur={() => setIsAadhaarFocused(false)}
            style={{...styles.input, width: "100%", boxSizing: "border-box"}}
          />
        </div>

        {/* FRONT AADHAAR */}
        <div style={styles.fileUploadGroup}>
          <label style={{ fontSize: "14px", fontWeight: "bold" }}>Aadhaar Front (Max 2MB)</label>
          <input
            type="file"
            name="aadhaarFront"
            accept="image/jpeg, image/png, image/jpg, application/pdf"
            onChange={handleFrontChange}
            ref={frontInputRef}
            style={styles.fileInput}
          />
          {frontError && <p style={styles.errorText}>{frontError}</p>}
          {aadhaarFront && (
            <p style={styles.successText}>
              ✅ Selected: {aadhaarFront.name}
            </p>
          )}
        </div>

        {/* BACK AADHAAR */}
        <div style={styles.fileUploadGroup}>
          <label style={{ fontSize: "14px", fontWeight: "bold" }}>Aadhaar Back (Max 2MB)</label>
          <input
            type="file"
            name="aadhaarBack"
            accept="image/jpeg, image/png, image/jpg, application/pdf"
            onChange={handleBackChange}
            ref={backInputRef}
            style={styles.fileInput}
          />
          {backError && <p style={styles.errorText}>{backError}</p>}
          {aadhaarBack && (
            <p style={styles.successText}>
              ✅ Selected: {aadhaarBack.name}
            </p>
          )}
        </div>

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
          style={{ color: "blue", cursor: "pointer", marginLeft: "5px" }}
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
    marginBottom: "40px",
  },

  form: {
    display: "flex",
    flexDirection: "column" as const,
    width: "320px",
    gap: "12px",
    marginTop: "20px",
  },

  inputGroup: {
    width: "100%",
  },

  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    width: "100%",
    boxSizing: "border-box" as const,
  },

  fileUploadGroup: {
    display: "flex",
    flexDirection: "column" as const,
    padding: "10px",
    border: "1px dashed #ccc",
    borderRadius: "5px",
    backgroundColor: "#f9f9f9",
  },

  fileInput: {
    marginTop: "8px",
    fontSize: "14px",
  },

  btn: {
    padding: "10px",
    backgroundColor: "#D4AF37",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    borderRadius: "5px",
    marginTop: "10px",
  },

  error: {
    color: "red",
    fontSize: "14px",
    textAlign: "center" as const,
  },
  
  errorText: {
    color: "red",
    fontSize: "12px",
    marginTop: "5px",
  },

  successText: {
    color: "green",
    fontSize: "12px",
    marginTop: "5px",
  },
};

export default Register;