import { useState } from "react";
import apiClient from "../../api/apiClient";

const SimulateStock = ({ symbol, onSimulate }) => {

  const [tradeMode, setTradeMode] = useState("BUY");      // BUY / SELL
  const [orderType, setOrderType] = useState("MARKET");  // MARKET / LIMIT
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");

  const handleSubmit = async () => {
    if (!quantity || quantity <= 0) return;

    try {

      // ===== MARKET ORDER =====
      if (orderType === "MARKET") {

        if (tradeMode === "BUY") {
          await apiClient.post("/api/transaction/buy", {
            stocksymbol: symbol,
            quantity: Number(quantity)
          });
        } else {
          await apiClient.post("/api/transaction/sell", {
            stocksymbol: symbol,
            quantity: Number(quantity)
          });
        }

      }

      // ===== LIMIT ORDER =====
      else {

        await apiClient.post(
          "/api/limit-order",
          null,
          {
            params: {
              stockSymbol: symbol,
              quantity: Number(quantity),
              targetPrice: Number(limitPrice),
              type: tradeMode
            }
          }
        );

      }

      setQuantity("");
      setLimitPrice("");

      if (onSimulate) onSimulate();

    } catch (err) {
      console.error("Trade failed:", err);
    }
  };

  return (
    <div className="trade-panel">

      {/* BUY / SELL */}
      <div>
        <button onClick={() => setTradeMode("BUY")}>
          Buy
        </button>
        <button onClick={() => setTradeMode("SELL")}>
          Sell
        </button>
      </div>

      {/* MARKET / LIMIT */}
      <div>
        <button onClick={() => setOrderType("MARKET")}>
          Market
        </button>
        <button onClick={() => setOrderType("LIMIT")}>
          Limit
        </button>
      </div>

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      {orderType === "LIMIT" && (
        <input
          type="number"
          placeholder="Limit Price"
          value={limitPrice}
          onChange={(e) => setLimitPrice(e.target.value)}
        />
      )}

      <button onClick={handleSubmit}>
        Place Order
      </button>
    </div>
  );
};

export default SimulateStock;