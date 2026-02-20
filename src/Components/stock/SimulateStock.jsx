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
    <div className="td-trade-container">

  <div className="td-trade-toggle-group">
    <button
      className={`td-trade-toggle td-trade-buy ${tradeMode === "BUY" ? "active" : ""}`}
      onClick={() => setTradeMode("BUY")}
    >
      Buy
    </button>

    <button
      className={`td-trade-toggle td-trade-sell ${tradeMode === "SELL" ? "active" : ""}`}
      onClick={() => setTradeMode("SELL")}
    >
      Sell
    </button>
  </div>

  <div className="td-trade-toggle-group">
    <button
      className={`td-trade-toggle ${orderType === "MARKET" ? "active" : ""}`}
      onClick={() => setOrderType("MARKET")}
    >
      Market
    </button>

    <button
      className={`td-trade-toggle ${orderType === "LIMIT" ? "active" : ""}`}
      onClick={() => setOrderType("LIMIT")}
    >
      Limit
    </button>
  </div>

  <input
    className="td-trade-input"
    type="number"
    placeholder="Quantity"
    value={quantity}
    onChange={(e) => setQuantity(e.target.value)}
  />

  {orderType === "LIMIT" && (
    <input
      className="td-trade-input"
      type="number"
      placeholder="Limit Price"
      value={limitPrice}
      onChange={(e) => setLimitPrice(e.target.value)}
    />
  )}

  <button
    className={`td-trade-submit ${tradeMode === "BUY" ? "buy" : "sell"}`}
    onClick={handleSubmit}
  >
    Place Order
  </button>

</div>
  );
};

export default SimulateStock;