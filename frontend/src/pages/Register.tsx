import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    aadhaar: "",   // ✔ fixed spelling
    mobile: "",
  });

  const handleChange = (e: any) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();

    // ✔ validation
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
      // ✔ backend API
      await axios.post("http://localhost:5000/api/users/register", user);

      alert("Registration successful");

      navigate("/"); // login page
    } catch (error) {
      alert("Error registering user");
    }
  };

  return (
    <div style={styles.container}>
      <h2>User Registration</h2>

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
          Register
        </button>
      </form>

      <p>
        Already have an account? <Link to="/">Login</Link>
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
  },

  btn: {
    padding: "10px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default Register;