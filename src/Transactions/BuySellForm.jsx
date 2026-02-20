import { useEffect, useState, useContext } from "react";
import axios from "axios";
import StockSelector from "../Components/stock/StockSelector";
import { toast } from "react-toastify";
import {
  FaExchangeAlt,
  FaHashtag,
  FaSortNumericUp,
  FaSpinner,
  FaDollarSign,
} from "react-icons/fa";
import { WebSocketContext } from "../context/WebSocketContext";
import apiClient from "../../api/apiClient";
const BuySellForm = ({ mode = null, stock = null, onSuccess }) => {
  const { latestUpdate } = useContext(WebSocketContext);

  const [form, setForm] = useState({
    stocksymbol: "",
    quantity: "",
    action: "buy",
  });

  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});

  useEffect(() => {
    if (mode) {
      setForm((prev) => ({
        ...prev,
        action: mode.toLowerCase(),
      }));
    }

    if (stock?.stocksymbol) {
      setForm((prev) => ({
        ...prev,
        stocksymbol: stock.stocksymbol,
        action: "sell",
      }));

      if (stock.currentPrice) {
        setCurrentPrice(Number(stock.currentPrice));
      }
    }
  }, [mode, stock]);

  // Live price update from WebSocket
  useEffect(() => {
    if (!form.stocksymbol) return;

    const live = latestUpdate?.[form.stocksymbol];
    if (live) {
      setCurrentPrice(Number(live));
    }
  }, [latestUpdate, form.stocksymbol]);

  const validate = () => {
    const errs = {};
    if (!form.stocksymbol)
      errs.stocksymbol = "Please enter the stock symbol";
    if (!form.quantity || form.quantity <= 0)
      errs.quantity = "Please enter a valid quantity";
    return errs;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const validationError = validate();
  if (Object.keys(validationError).length > 0) {
    setError(validationError);
    return;
  }

  try {
    setLoading(true);

    const endpoint =
      form.action === "buy"
        ? "/api/transaction/buy"
        : "/api/transaction/sell";

    const payload = {
      stocksymbol: form.stocksymbol,
      quantity: Number(form.quantity),
    };

    const response = await apiClient.post(endpoint, payload);

    toast.success(response.data);

    setForm({
      stocksymbol: "",
      quantity: "",
      action: "buy",
    });

    if (onSuccess) onSuccess();

  } catch (err) {
    toast.warn(err.response?.data || "Transaction Failed");
  } finally {
    setLoading(false);
  }
};

  const isSellMode = form.action === "sell";
  const estimatedTotal =
    currentPrice && form.quantity
      ? currentPrice * Number(form.quantity)
      : 0;

  return (
    <form onSubmit={handleSubmit} className="trade-panel">
      <h3 className="trade-title">
        {isSellMode ? "Sell Stock" : "Buy Stock"}
      </h3>

      <label>
        <FaHashtag className="icon" />
        Stock Symbol:
        {isSellMode && stock ? (
          <input
            type="text"
            value={form.stocksymbol}
            disabled
            className="locked-input"
          />
        ) : (
          <StockSelector
            selectedSymbol={form.stocksymbol}
            onChange={(symbol) =>
              setForm({ ...form, stocksymbol: symbol })
            }
          />
        )}
        {error.stocksymbol && (
          <div className="error">{error.stocksymbol}</div>
        )}
      </label>

      <label>
        <FaSortNumericUp className="icon" />
        Quantity:
        <input
          type="number"
          min="1"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.value })
          }
        />
        {error.quantity && (
          <div className="error">{error.quantity}</div>
        )}
      </label>

      <div className="price-preview">
        <div>
          <FaDollarSign /> Current Price:
          <strong>
            {currentPrice ? `$${currentPrice.toFixed(2)}` : "Loading..."}
          </strong>
        </div>
        <div>
          Estimated {isSellMode ? "Proceeds" : "Cost"}:
          <strong>
            {estimatedTotal
              ? `$${estimatedTotal.toFixed(2)}`
              : "$0.00"}
          </strong>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`trade-btn ${
          isSellMode ? "sell-mode" : "buy-mode"
        }`}
      >
        {loading ? (
          <>
            Processing <FaSpinner className="icons-spin" />
          </>
        ) : isSellMode ? (
          "Confirm Sell"
        ) : (
          "Confirm Buy"
        )}
      </button>
    </form>
  );
};

export default BuySellForm;
