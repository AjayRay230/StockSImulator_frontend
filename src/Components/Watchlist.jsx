import { useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "../context/userContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { FaMoon, FaSun } from "react-icons/fa";
import apiClient from "../../api/apiClient";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import StockPrice from "./stock/StockPrice";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
const SortableRow = ({ stock, onClick, onRemove, expanded }) => {
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
      ref={setNodeRef}
      style={style}
      className={`watch-row ${expanded ? "expanded" : ""}`}
      onClick={() => onClick(stock.stocksymbol)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.25 }}
    >
      {/* DRAG HANDLE ONLY */}
      <div
        className="drag-handle"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        ⋮⋮
      </div>

      <div className="row-left">
        <div className="symbol">{stock.stocksymbol}</div>
        <div className="company">{stock.companyname}</div>
      </div>

      <div className="row-right">
        <div className="price">
          ${Number(stock.price).toFixed(2)}
        </div>

        <div className={isUp ? "positive" : "negative"}>
          {isUp ? "+" : ""}
          {Number(stock.percentChange).toFixed(2)}%
        </div>

        <button
          className="remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(stock);
          }}
        >
          ✕
        </button>
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
  const [confirmStock, setConfirmStock] = useState(null);
  const [toastStock, setToastStock] = useState(null);
  const undoTimerRef = useRef(null);
 
  const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5
    }
  })
);
  const fetchWatchlist = useCallback(async () => {
  if (!user) return;

  try {
    setLoading(true);

    const listRes = await apiClient.get("/api/watchlist/me");

    const symbols = listRes.data.map((s) => s.stocksymbol);

    if (symbols.length === 0) {
      setStocks([]);
      return;
    }

    const liveRes = await apiClient.get("/api/stock-price/batch-live", {
      params: { symbols },
      paramsSerializer: (params) =>
        params.symbols.map((s) => `symbols=${s}`).join("&"),
    });

    setStocks(liveRes.data);
  } catch (err) {
    console.error("Watchlist fetch failed:", err);
  } finally {
    setLoading(false);
  }
}, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  /* =======================
     Debounced Search
 */
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
      const res = await apiClient.get("/api/stock/suggestions", {
        params: { query: value },
      });

      setSearchResults(res.data);
      setSearchMode(true);
    } catch (err) {
      console.error("Search failed:", err);
    }
  }, 300);
};


  /* =======================
     Add to Watchlist
  ======================== */
 const addToWatchlist = async (symbol) => {
  try {
    await apiClient.post("/api/watchlist/add", {
      stocksymbol: symbol,
    });

    setSearch("");
    setSearchMode(false);
    setSearchResults([]);
    fetchWatchlist();
  } catch (err) {
    console.error("Add failed:", err.response?.data || err);
  }
};

  /* =======================
   Remove from Watchlist
======================= */

const requestRemove = (stock) => {
  setConfirmStock(stock);
};

const confirmRemove = async () => {
  if (!confirmStock) return;

  const removedStock = confirmStock;
  setConfirmStock(null);

  setStocks((prev) =>
    prev.filter((s) => s.stocksymbol !== removedStock.stocksymbol)
  );

  if (selected === removedStock.stocksymbol) {
    setSelected(null);
  }

  try {
    await apiClient.post("/api/watchlist/remove", {
      stocksymbol: removedStock.stocksymbol,
    });

    setToastStock(removedStock);

    undoTimerRef.current = setTimeout(() => {
      setToastStock(null);
    }, 5000);

  } catch (err) {
    console.error("Remove failed:", err.response?.data || err);
    fetchWatchlist();
  }
};

const undoRemove = async () => {
  if (!toastStock) return;

  clearTimeout(undoTimerRef.current);

  try {
    await apiClient.post("/api/watchlist/add", {
      stocksymbol: toastStock.stocksymbol,
    });

    fetchWatchlist();
    setToastStock(null);
  } catch (err) {
    console.error("Undo failed:", err);
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
              <div className="watchlist-scroll">
              
                    <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
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
                  onRemove={requestRemove}
                  expanded={selected === stock.stocksymbol}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>
              </div>
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

        <AnimatePresence>
  {confirmStock && (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <p>
          Remove <strong>{confirmStock.stocksymbol}</strong> from watchlist?
        </p>

        <div className="modal-actions">
          <button onClick={() => setConfirmStock(null)}>
            Cancel
          </button>

          <button className="danger" onClick={confirmRemove}>
            Remove
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
<AnimatePresence>
  {toastStock && (
    <motion.div
      className="toast"
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
    >
      {toastStock.stocksymbol} removed
      <button onClick={undoRemove}>Undo</button>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
};

export default WatchList;