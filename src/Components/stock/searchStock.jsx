import axios from "axios";
import { FaChartLine, FaClock, FaSpinner } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SearchStock = () => {
  const { symbol } = useParams();

  const [stock, setStock] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true);
        setError("");
        setStock(null);

        const token = localStorage.getItem("token");

        const response = await axios.get(
  `https://stocksimulator-backend.onrender.com/api/stock/detail/${symbol}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
        setStock(response.data);

      } catch {
        setError("Stock not found");
      } finally {
        setLoading(false);
      }
    };

    if (symbol) fetchStock();
  }, [symbol]);

  const isPositive = stock?.changepercent >= 0;

  return (
    <div className="search-card">

      {loading && (
        <div className="searchstock-loading">
          <FaSpinner className="icons-spin" /> Loading...
        </div>
      )}

      {error && !loading && (
        <p className="error-stocksymbol">{error}</p>
      )}

      {stock && !loading && (
        <div className="searchstock-body">

          <h2 className="searchstock-title">
            {stock.companyname}
            <span className="searchstock-symbol">
              ({stock.symbol})
            </span>
          </h2>

          <div className="searchstock-price">
            ${Number(stock.currentprice || 0).toFixed(2)}
          </div>

          <div
            className={`searchstock-change ${
              isPositive
                ? "searchstock-positive"
                : "searchstock-negative"
            }`}
          >
            <FaChartLine />
            {isPositive ? "+" : ""}
            {Number(stock.changepercent || 0).toFixed(2)}%
          </div>

          <div className="searchstock-updated">
            <FaClock />
            {stock.lastupdate
              ? `Updated ${new Date(stock.lastupdate).toLocaleString()}`
              : "Update time unavailable"}
          </div>

        </div>
      )}
    </div>
  );
};

export default SearchStock;