import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient"; // fix path

const StockPage = () => {
  const [stocks, setStocks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get("/api/stock-price/batch-live")
      .then((res) => setStocks(res.data))
      .catch((err) => console.error("Batch live fetch failed:", err));
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
            <th>Price</th>
            <th>Change</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.symbol} onClick={() => handleClick(stock.symbol)}>
              <td>{stock.symbol}</td>
              <td>{stock.price}</td>
              <td>{stock.changePercent}%</td>
              <td>{stock.volume}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockPage;
