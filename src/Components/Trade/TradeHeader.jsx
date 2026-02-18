import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";

const TradeHeader = ({ symbol }) => {
  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(0);
  const [percent, setPercent] = useState(0);

  const fetchPrice = async () => {
    try {
const response = await apiClient.get(
  `/api/stock-price/closing-price`,
  { params: { stocksymbol: symbol } }
);

const meta = response.data.meta;

setPrice(meta.currentPrice);
setChange(meta.change);
setPercent(meta.changePercent);

    } catch (err) {
      console.log("Header price fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, [symbol]);

  const isPositive = change >= 0;

  return (
    <div className="trade-header-info">
      <h2>{symbol}</h2>

      {price !== null && (
        <div className="price-block">
          <span className="live-price">
            ${price.toFixed(2)}
          </span>

          <span
            className={`price-change ${
              isPositive ? "positive" : "negative"
            }`}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(2)} (
            {isPositive ? "+" : ""}
            {percent.toFixed(2)}%)
          </span>
        </div>
      )}
    </div>
  );
};

export default TradeHeader;
