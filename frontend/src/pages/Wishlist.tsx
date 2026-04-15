import { useEffect, useState } from "react";
import axios from "axios";

const Wishlist = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/wishlist")
      .then(res => setItems(res.data));
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Wishlist</h2>

      {items.map((item:any) => (
        <div key={item._id}>
          <h3>{item.productName}</h3>
          <p>{item.price}</p>
        </div>
      ))}
    </div>
  );
};

export default Wishlist;