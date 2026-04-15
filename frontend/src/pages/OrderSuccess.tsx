import { useLocation, Link } from "react-router-dom";

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <h2>Order Placed Successfully 🎉</h2>

      <p>Your Order ID:</p>

      <h1 style={{ color: "#D4AF37" }}>{orderId}</h1>

      <p>
        Please visit the shop and show this Order ID to collect your jewellery.
      </p>

      <Link to="/">
        <button style={styles.btn}>Go to Home</button>
      </Link>
    </div>
  );
};

const styles = {
  btn: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default OrderSuccess;