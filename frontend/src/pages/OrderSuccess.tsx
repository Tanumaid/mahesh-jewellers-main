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

      <p style={{ marginTop: "15px", color: "#f39c12", fontWeight: "bold" }}>
        Note: Your order is currently Pending Approval. <br/>
        You can download the final invoice from your Orders page once approved by the Admin.
      </p>

      <div style={{ marginTop: "30px", display: "flex", gap: "15px", justifyContent: "center" }}>
        <Link to="/orders">
          <button style={styles.invoiceBtn}>View My Orders</button>
        </Link>

        <Link to="/">
          <button style={styles.btn}>Go to Home</button>
        </Link>
      </div>
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
    borderRadius: "5px"
  },
  invoiceBtn: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#D4AF37",
    color: "#000",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px"
  },
};

export default OrderSuccess;