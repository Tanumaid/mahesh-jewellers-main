import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <h1>Welcome to Mahesh Jewellers 💎</h1>

      {user && <h3>Hello, {user.name}</h3>}

      <p>Explore beautiful jewellery collections!</p>

      <div style={styles.buttons}>
        <button style={styles.viewBtn} onClick={() => navigate("/products")}>
          View Products
        </button>

        {user && (
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center" as const,
    marginTop: "80px",
  },
  buttons: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  },
  viewBtn: {
    padding: "10px 20px",
    backgroundColor: "gold",
    border: "none",
    cursor: "pointer",
  },
  logoutBtn: {
    padding: "10px 20px",
    backgroundColor: "red",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default Home;