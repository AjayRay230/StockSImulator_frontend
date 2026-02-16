import { useEffect, useState } from "react";
import axios from "axios";

const TradeHeader = ({ symbol }) => {
  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(0);
  const [percent, setPercent] = useState(0);

  const fetchPrice = async () => {
    try {
      const response = await axios.get(
        `https://stocksimulator-backend.onrender.com/api/stock/price/${symbol}`
      );

      const data = response.data;

      setPrice(data.currentPrice);
      setChange(data.change);
      setPercent(data.percentChange);
    } catch (err) {
      console.log("Header price fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPrice();

    const interval = setInterval(fetchPrice, 5000); // refresh every 5 sec

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
