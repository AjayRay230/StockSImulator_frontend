import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import StockPrice from "../stock/StockPrice";
import SimulateStock from "../stock/SimulateStock";
import OrderBook from "../stock/OrderBook";
import TradeHeader from "./TradeHeader";

const TradePage = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="trade-terminal">

      {/* Header */}
      <div className="terminal-header">
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Market Overview
        </button>

        <TradeHeader symbol={symbol} />
      </div>

<div className="terminal-body">

  {/* Chart Section */}
  <div className="terminal-chart">
    <StockPrice
      symbol={symbol}
      refreshKey={refreshKey}
      onSimulate={() =>
        setRefreshKey(prev => prev + 1)
      }
    />
  </div>

  {/* Order + OrderBook Section */}
  <div className="terminal-order-section">

    {/* Order Panel */}
    <div className="terminal-order">
      <SimulateStock
        symbol={symbol}
        onSimulate={() =>
          setRefreshKey(prev => prev + 1)
        }
      />
    </div>

    {/*  ORDER BOOK HERE */}
    <div className="terminal-orderbook">
      <OrderBook symbol={symbol} />
    </div>

  </div>

</div>

      {/* Footer Metrics */}
      <div className="terminal-footer">
        <div>Position: --</div>
        <div>Unrealized P&L: --</div>
        <div>Exposure: --</div>
        <div>Trades Today: --</div>
      </div>

    </div>
  );
};

export default TradePage;
