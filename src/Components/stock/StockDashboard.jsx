import { useState } from "react";
import StockPrice from "./StockPrice";

import TradeHeader from "../Trade/TradeHeader";
import StockSelector from "./StockSelector";

const StockDashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="trade-terminal">

      {/* Header */}
      <div className="terminal-header">
        <TradeHeader symbol={selectedSymbol} />

        <StockSelector
          selectedSymbol={selectedSymbol}
          onChange={setSelectedSymbol}
        />
      </div>

      {/* Body */}
      <div className="terminal-body">

        {/* Chart Section */}
        <div className="terminal-chart">
          <StockPrice
            symbol={selectedSymbol}
            refreshKey={refreshKey}
            onSimulate={() =>
              setRefreshKey(prev => prev + 1)
            }
          />
        </div>

        {/* Order + OrderBook
        <div className="terminal-order-section">

          <div className="terminal-order">
            <SimulateStock
              symbol={selectedSymbol}
              onSimulate={() =>
                setRefreshKey(prev => prev + 1)
              }
            />
          </div>

          <div className="terminal-orderbook">
            <OrderBook symbol={selectedSymbol} />
          </div>

        </div> */}

      </div>

      {/* Footer */}
      {/* <div className="terminal-footer">
        <div>Position: --</div>
        <div>Unrealized P&L: --</div>
        <div>Exposure: --</div>
        <div>Trades Today: --</div>
      </div> */}

    </div>
  );
};

export default StockDashboard;