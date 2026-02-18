import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

const StockPage = () => {
  const [stocks, setStocks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        // 1️⃣ Get all DB stocks
        const symbolRes = await apiClient.get("/api/stock-price/symbol");

        if (!Array.isArray(symbolRes.data)) {
          console.error("Invalid symbol response:", symbolRes.data);
          return;
        }

        const symbols = symbolRes.data.map((stock) => stock.symbol);

        if (symbols.length === 0) return;

        // 2️⃣ Fetch live prices
        const liveRes = await apiClient.get(
          "/api/stock-price/batch-live",
          {
            params: { symbols }
          }
        );

        if (Array.isArray(liveRes.data)) {
          setStocks(liveRes.data);
        } else {
          console.error("Invalid live response:", liveRes.data);
        }

      } catch (err) {
        console.error("Market overview fetch failed:", err);
      }
    };

    fetchStocks();
  }, []);

  const handleClick = (symbol) => {
    navigate(`/market?symbol=${symbol}`);
  };

  return (
    <div className="stock-page">
      <h1>Market Overview</h1>

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
          {stocks.map((stock) => (
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
