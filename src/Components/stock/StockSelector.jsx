import axios from "axios";
import { useEffect, useState } from "react";

const StockSelector = ({ selectedSymbol, onChange }) => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchStocks();
    }, 400);

    return () => clearTimeout(timer);
  }, [input]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `/api/stock/search?query=${input}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuggestions(res.data);
      setShowDropdown(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (stock) => {
    setInput(`${stock.symbol} - ${stock.companyname}`);
    onChange(stock.symbol);   // send only symbol to parent form
    setShowDropdown(false);
  };

  return (
    <div className="stock-selector">
      <input
        type="text"
        placeholder="Search stock (AAPL, Apple...)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => suggestions.length && setShowDropdown(true)}
      />

      {showDropdown && suggestions.length > 0 && (
        <ul className="stock-dropdown">
          {suggestions.map((stock) => (
            <li
              key={stock.symbol}
              onMouseDown={() => handleSelect(stock)}
            >
              <strong>{stock.symbol}</strong>
              <span> — {stock.companyname}</span>
            </li>
          ))}
        </ul>
      )}

      {loading && <div className="selector-loading">Searching...</div>}
    </div>
  );
};

export default StockSelector;