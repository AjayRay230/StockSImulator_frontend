import { useState } from "react";
import StockDashboard from "./StockDashboard";
import StockSelector from "./StockSelector";
import StockPrice from "./StockPrice";

const StockPage = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL"); 

  return (
    <div className="stock-page">
      <h1>Stock Overview</h1>

      <div className="stock-controls">
        <StockSelector
          selectedSymbol={selectedSymbol}
          onChange={setSelectedSymbol} 
        />
        {selectedSymbol && <StockPrice symbol={selectedSymbol} />}
      </div>
    </div>
  );
};

export default StockPage;
