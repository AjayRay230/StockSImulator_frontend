import axios from "axios";
import { FaDollarSign, FaChartLine, FaClock } from "react-icons/fa";
import {useRef, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StylesSearchBox from "./StylesSearchBox";

const SearchStock = () => {
  //   const inputRef = useRef(null);
  // const [suggestions, setSuggestions] = useState([]);
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [error, setError] = useState("");
// const[showSuggestion,setShowSuggestion] = useState(false);
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await axios.get(`https://stocksimulator-backend.onrender.com/api/stock/${symbol}`,{
  //       headers:{
  //                       Authorization:`Bearer ${token}`
  //               }
  //     });
  //     setStock(response.data);
  //     setError("");
  //   } catch (err) {
  //     setStock(null);
  //     setError(err.response?.data.message || "Stock not found or server error");
  //     alert("Stock not found");
  //   }
  // };

  // useEffect(() => {
  //   if (symbol.length > 1) {
  //     const token = localStorage.getItem("token");
  //     axios
  //       .get(`https://stocksimulator-backend.onrender.com/api/stock/suggestions?query=${symbol}`,{
  //         headers:{
  //           Authorization : `Bearer ${token}`
  //         }
  //       })
  //       .then((res) => {
  //         const symbolList = res.data.map(stock=>stock.symbol);
  //         setSuggestions(symbolList);
  //       })
  //       .catch((err) => {
  //           console.log(err);
  //           setSuggestions([]);});
  //   } else {
  //     setSuggestions([]);
  //   }
  // }, [symbol]);

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
    <div style={StylesSearchBox.chart}>
      {/* <h2 style={StylesSearchBox.title}>Search stocks by its symbol</h2>
      <form className="stockSymbol-form" onSubmit={handleSubmit}>
        <input
        ref = {inputRef}
          className="input-stocksymbol"
          type="text"
          placeholder="Enter symbol e.g. AAPL"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          onBlur={()=>setTimeout(()=>{
            setShowSuggestion(false)
           
        
          },100)}
        />
{showSuggestion && (
  <ul className="suggestion-list">
    {Array.isArray(suggestions) && suggestions.length > 0 ? (
      suggestions.map((s, i) => (
        <li
          key={i}
          onMouseDown={() => {
            setSymbol(s);
            setSuggestions([]);
            setShowSuggestion(false);
          }}
        >
          {s}
        </li>
      ))
    ) : (
      symbol.length > 1 && (
        <li style={{ padding: "8px", color: "#777" }}>
          No matches found
        </li>
      )
    )}
  </ul>
)}

        <button type="submit" className="stocksymbol-btn">
          Search
        </button>
      </form> */}

      {error && <p className="error-stocksymbol">{error}</p>}

      {stock && (
        <div>
          <h3   className="companyname-searchstock">
            <Link to = "/stock">
            {stock.companyname} ({stock.symbol})
            </Link>
          </h3>
         
          <p>
            <FaDollarSign style={{ marginRight: "6px", color: "#444" }} />
            <strong>Price:</strong> ${stock.currentprice}
          </p>
          <p style={{ color: stock.changepercent >= 0 ? "green" : "red" }}>
            <FaChartLine style={{ marginRight: "6px" }} />
            <strong>Change:</strong> {stock.changepercent}%
          </p>
          <p>
            <FaClock style={{ marginRight: "6px", color: "#555" }} />
            <strong>Last Updated:</strong>{" "}
            {new Date(stock.lastupdate).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchStock;
