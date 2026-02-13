import axios from "axios";
import { FaDollarSign, FaChartLine, FaClock } from "react-icons/fa";
import {useRef, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";


const SearchStock = () => {

  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [error, setError] = useState("");


useEffect(() => {
  const fetchStock = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://stocksimulator-backend.onrender.com/api/stock/${symbol}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStock(response.data);
      setError("");
    } catch (err) {
      setStock(null);
      setError("Stock not found");
    }
  };

  if (symbol) fetchStock();
}, [symbol]);
  return (
    <div className="search-card">

      {error && <p className="error-stocksymbol">{error}</p>}
      {stock && (
  <div className="searchstock-body">

    <h2 className="searchstock-title">
      {stock.companyname}
      <span className="searchstock-symbol">
        ({stock.symbol})
      </span>
    </h2>

    <div className="searchstock-price">
      ${stock.currentprice}
    </div>

    <div
      className={`searchstock-change ${
        stock.changepercent >= 0
          ? "searchstock-positive"
          : "searchstock-negative"
      }`}
    >
      <FaChartLine />
      {stock.changepercent >= 0 ? "+" : ""}
      {stock.changepercent}%
    </div>

    <div className="searchstock-updated">
      <FaClock />
      Updated {new Date(stock.lastupdate).toLocaleString()}
    </div>

  </div>
)}
    </div>
  );
};

export default SearchStock;
