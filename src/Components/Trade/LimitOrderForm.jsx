import { useState } from "react";
import axios from "axios";

export default function LimitOrderForm({ symbol }) {
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("BUY");

  const placeOrder = async () => {
    await axios.post("/api/orders/limit", {
      stockSymbol: symbol,
      quantity: Number(quantity),
      targetPrice: Number(price),
      type,
    });
  };

  return (
    <div className="limit-order-box">
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="BUY">BUY</option>
        <option value="SELL">SELL</option>
      </select>

      <input
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      <input
        placeholder="Limit Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <button onClick={placeOrder}>Place Limit Order</button>
    </div>
  );
}