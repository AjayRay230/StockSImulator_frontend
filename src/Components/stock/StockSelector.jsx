import axios from "axios";
import { useEffect, useState } from "react";

const StockSelector = ({ selectedSymbol, onChange }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const token = localStorage.getItem("token");
       // console.log("JWT Token:", token);

        const response = await axios.get("https://stocksimulator-backend.onrender.com/api/stock/symbol", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

       // console.log("Stock options response:", response.data); // debug log
        setOptions(response.data); // assumed response is a list of objects like { symbol: "AAPL", ... }
      } catch (err) {
        console.error("Error while fetching the stock list", err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSymbols();
  }, []);

  if (loading) return <h2  style={{textAlign:"center",fontSize:"18px",color:"#666"}}>Loading ...</h2>;

  return (
    <div className="stock-selector-container">
      <label htmlFor="stock-dropdown" className="label">
        Select from availabel stocks:
      </label>
      <select
      id = "stock-dropdown"
        value={selectedSymbol}
        onChange={(e) => onChange(e.target.value)}
        className="drowpdown"
      >
        <option value="" disabled hidden>
          -- choose a stock --
        </option>
        {options.map((item, index) => (
          <option key={index} value={item.symbol}>
            {item.symbol}
          </option>
        ))}
      </select>
        <label htmlFor="manual-input"  className="label">
          Or search manually:
        </label>
      
      <input
        type="text"
        id = "manual-input"
        className="manual-input"
        value = {selectedSymbol}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder="Enter the symbol (e.g. AAPL, GOOGL)"
      />
    </div>
  );
};

export default StockSelector;
