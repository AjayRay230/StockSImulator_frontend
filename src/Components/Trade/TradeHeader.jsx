import { useEffect, useState, useContext } from "react";
import { WebSocketContext } from "../../context/WebSocketContext";

const TradeHeader = ({ symbol }) => {
  const { latestUpdate } = useContext(WebSocketContext);

  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(0);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!latestUpdate) return;

    if (Array.isArray(latestUpdate)) {
      const update = latestUpdate.find(u => u.symbol === symbol);
      if (!update) return;

      setPrice(update.price);
      setChange(update.change);
      setPercent(update.percentChange);
    }
  }, [latestUpdate, symbol]);

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
