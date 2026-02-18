import { useState } from "react";
import StockPrice from "./StockPrice";
import TradeHeader from "../Trade/TradeHeader";
import StockSelector from "./StockSelector";
import SimulateStock from "./SimulateStock";
import OrderBook from "./OrderBook";
import { useLocation } from "react-router-dom";
const StockDashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [refreshKey, setRefreshKey] = useState(0);
  const location = useLocation();

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const symbolFromUrl = params.get("symbol");
  if (symbolFromUrl) {
    setSelectedSymbol(symbolFromUrl);
  }
}, [location]);

  return (
    <div className="trade-terminal">

      {/* ===== HEADER ===== */}
      <div className="terminal-header">
        <TradeHeader symbol={selectedSymbol} />
        <StockSelector
          selectedSymbol={selectedSymbol}
          onChange={setSelectedSymbol}
        />
      </div>

      {/* ===== MARKET QUICK STATS ===== */}
      <div className="terminal-stats">
        <div className="stat-card">
          <span>High</span>
          <strong>--</strong>
        </div>
        <div className="stat-card">
          <span>Low</span>
          <strong>--</strong>
        </div>
        <div className="stat-card">
          <span>Volume</span>
          <strong>--</strong>
        </div>
        <div className="stat-card">
          <span>Market Cap</span>
          <strong>--</strong>
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div className="terminal-body">

        {/* LEFT SIDE → Chart */}
        <div className="terminal-chart">
          <StockPrice
            symbol={selectedSymbol}
            refreshKey={refreshKey}
            onSimulate={() =>
              setRefreshKey(prev => prev + 1)
            }
          />
        </div>

        {/* RIGHT SIDE → Trade Panel */}
        <div className="terminal-side-panel">

          <div className="trade-box">
            <SimulateStock
              symbol={selectedSymbol}
              onSimulate={() =>
                setRefreshKey(prev => prev + 1)
              }
            />
          </div>

          <div className="orderbook-box">
            <OrderBook symbol={selectedSymbol} />
          </div>

        </div>

      </div>

      {/* ===== FOOTER ===== */}
      <div className="terminal-footer">
        <div>Position: --</div>
        <div>Unrealized P&L: --</div>
        <div>Exposure: --</div>
        <div>Trades Today: --</div>
      </div>

    </div>
  );
};

export default StockDashboard;