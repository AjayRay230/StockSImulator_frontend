import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";

import { WebSocketContext } from "../../context/WebSocketContext";


const StockPage = () => {
  const [stocks, setStocks] = useState({});
  const navigate = useNavigate();
  const { latestUpdate } = useContext(WebSocketContext);

 
  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const res = await apiClient.get("/api/stock/symbol");

        if (!Array.isArray(res.data)) return;

        const initialMap = {};
        res.data.forEach((stock) => {
          initialMap[stock.symbol] = {
            stocksymbol: stock.symbol,
            companyname: stock.companyName,
            price: 0,
            change: 0,
            percentChange: 0
          };
        });

        setStocks(initialMap);

      } catch (err) {
        console.error("Symbol fetch failed:", err);
      }
    };

    fetchSymbols();
  }, []);

  // 2️⃣ Listen to WebSocket updates
useEffect(() => {
  if (!latestUpdate) return;

  // If backend sends array
  if (Array.isArray(latestUpdate)) {
    setStocks((prev) => {
      const updated = { ...prev };

      latestUpdate.forEach((update) => {
        updated[update.symbol] = {
          ...updated[update.symbol],
          price: update.price,
          change: update.change,
          percentChange: update.percentChange
        };
      });

      return updated;
    });

  } else {
    // If backend sends single object
    setStocks((prev) => ({
      ...prev,
      [latestUpdate.symbol]: {
        ...prev[latestUpdate.symbol],
        price: latestUpdate.price,
        change: latestUpdate.change,
        percentChange: latestUpdate.percentChange
      }
    }));
  }

}, [latestUpdate]);


  const handleClick = (symbol) => {
    navigate(`/market?symbol=${symbol}`);
  };

  return (
    <div className="stock-page">
      <h1>Market Overview (Live)</h1>

      <table className="market-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Company</th>
            <th>Price</th>
            <th>Change</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(stocks).map((stock) => (
            <tr
              key={stock.stocksymbol}
              onClick={() => handleClick(stock.stocksymbol)}
              style={{ cursor: "pointer" }}
            >
              <td>{stock.stocksymbol}</td>
              <td>{stock.companyname}</td>
              <td>{stock.price}</td>
              <td>{stock.change}</td>
              <td
                style={{
                  color:
                    stock.percentChange > 0
                      ? "limegreen"
                      : stock.percentChange < 0
                      ? "red"
                      : "white"
                }}
              >
                {stock.percentChange}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockPage;
