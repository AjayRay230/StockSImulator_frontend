import { useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "../context/userContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import StockPrice from "./stock/StockPrice";

const SortableRow = ({ stock, onClick, expanded }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: stock.stocksymbol });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const isUp = stock.percentChange >= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`watch-row ${expanded ? "expanded" : ""}`}
      onClick={() => onClick(stock.stocksymbol)}
    >
      <div className="row-left">
        <div className="symbol">{stock.stocksymbol}</div>
        <div className="company">{stock.companyname}</div>
      </div>

      <div className="row-right">
        <div className="price">${Number(stock.price).toFixed(2)}</div>
        <div className={isUp ? "positive" : "negative"}>
          {isUp ? "+" : ""}
          {Number(stock.percentChange).toFixed(2)}%
        </div>
      </div>
    </motion.div>
  );
};

const WatchList = () => {
  const { user } = useUser();
  const [stocks, setStocks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchMode, setSearchMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const fetchWatchlist = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const listRes = await axios.get(
        `https://stocksimulator-backend.onrender.com/api/watchlist/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const symbols = listRes.data.map((s) => s.stocksymbol);

      if (symbols.length === 0) {
        setStocks([]);
        return;
      }

      const liveRes = await axios.get(
        `https://stocksimulator-backend.onrender.com/api/stock-price/batch-live`,
        {
          params: { symbols },
          paramsSerializer: (params) =>
            params.symbols.map((s) => `symbols=${s}`).join("&"),
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStocks(liveRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  /* =======================
     Debounced Search
  ======================== */
  const handleSearch = (value) => {
    setSearch(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSearchMode(false);
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `https://stocksimulator-backend.onrender.com/api/stock/suggestions`,
          {
            params: { query: value },
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setSearchResults(res.data);
        setSearchMode(true);
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 300);
  };

  /* =======================
     Add to Watchlist
  ======================== */
  const addToWatchlist = async (symbol) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `https://stocksimulator-backend.onrender.com/api/watchlist/add`,
        { stocksymbol: symbol },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSearch("");
      setSearchMode(false);
      setSearchResults([]);
      fetchWatchlist();
    } catch (err) {
      console.error("Add failed", err.response?.data || err);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stocks.findIndex((s) => s.stocksymbol === active.id);
    const newIndex = stocks.findIndex((s) => s.stocksymbol === over.id);

    const updated = [...stocks];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);

    setStocks(updated);
  };

  const gainers = stocks.filter((s) => s.percentChange > 0);
  const losers = stocks.filter((s) => s.percentChange <= 0);

  return (
    <div className="terminal-layout">
      <div className="watchlist-panel">
        <h3>WATCHLIST</h3>

        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search stock to add..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />

          <AnimatePresence>
            {searchMode && searchResults.length > 0 && (
              <motion.div
                className="search-dropdown"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {searchResults.map((stock) => {
                  const alreadyAdded = stocks.some(
                    (s) => s.stocksymbol === stock.symbol
                  );

                  return (
                    <div key={stock.symbol} className="search-item">
                      <div>
                        <strong>{stock.symbol}</strong> -{" "}
                        {stock.companyname}
                      </div>

                      <button
                        disabled={alreadyAdded}
                        onClick={() =>
                          !alreadyAdded &&
                          addToWatchlist(stock.symbol)
                        }
                        className="add-btn"
                      >
                        {alreadyAdded ? "Added" : "Add"}
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {loading && <div className="loading">Updating prices...</div>}

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={stocks.map((s) => s.stocksymbol)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence>
              {stocks.map((stock) => (
                <SortableRow
                  key={stock.stocksymbol}
                  stock={stock}
                  onClick={setSelected}
                  expanded={selected === stock.stocksymbol}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>

        <div className="group-section">
          <h4>GAINERS</h4>
          {gainers.map((s) => (
            <div key={s.stocksymbol} className="mini-row positive">
              {s.stocksymbol} +{Number(s.percentChange).toFixed(2)}%
            </div>
          ))}

          <h4>LOSERS</h4>
          {losers.map((s) => (
            <div key={s.stocksymbol} className="mini-row negative">
              {s.stocksymbol} {Number(s.percentChange).toFixed(2)}%
            </div>
          ))}
        </div>
      </div>

      <div className="chart-panel">
        {selected ? (
          <StockPrice symbol={selected} />
        ) : (
          <div className="placeholder">Select a stock</div>
        )}
      </div>
    </div>
  );
};

export default WatchList;