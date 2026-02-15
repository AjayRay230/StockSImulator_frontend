import { useEffect, useState, useRef } from "react";
import { useUser } from "../context/userContext";
import axios from "axios";
import LivePrice from "./stock/LivePrice";
import { FiPlusCircle, FiTrash } from "react-icons/fi";
import { motion } from "framer-motion";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

const WatchList = () => {
  const { user } = useUser();

  const [watchlist, setWatchlist] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [companyMap, setCompanyMap] = useState({});
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounceRef = useRef(null);

  /* ---------------- LOAD WATCHLIST ---------------- */

  useEffect(() => {
    if (!user) return;

    const fetchList = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `https://stocksimulator-backend.onrender.com/api/watchlist/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const savedOrder =
        JSON.parse(localStorage.getItem("watchlistOrder")) || [];

      const ordered = res.data.sort(
        (a, b) =>
          savedOrder.indexOf(a.stocksymbol) -
          savedOrder.indexOf(b.stocksymbol)
      );

      setWatchlist(ordered);

      // Batch full names
      const symbols = ordered.map((i) => i.stocksymbol);

      if (symbols.length > 0) {
        const liveRes = await axios.get(
          `https://stocksimulator-backend.onrender.com/api/stock-price/batch-live`,
          {
            params: { symbols },
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const map = {};
        liveRes.data.forEach((s) => {
          map[s.symbol] = s.name;
        });

        setCompanyMap(map);
      }
    };

    fetchList();
  }, [user]);

  /* ---------------- SEARCH AUTO SUGGEST ---------------- */

  useEffect(() => {
    if (!symbol.trim()) {
      setSuggestions([]);
      return;
    }

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `https://stocksimulator-backend.onrender.com/api/stock/suggestions`,
        {
          params: { query: symbol },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuggestions(res.data || []);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [symbol]);

  /* ---------------- KEYBOARD NAVIGATION ---------------- */

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      handleAdd(suggestions[activeIndex].symbol);
    }
  };

  /* ---------------- ADD STOCK ---------------- */

  const handleAdd = async (selectedSymbol = null) => {
    const finalSymbol = selectedSymbol || symbol;
    if (!finalSymbol) return;

    if (watchlist.find((w) => w.stocksymbol === finalSymbol)) return;

    const token = localStorage.getItem("token");

    await axios.post(
      `https://stocksimulator-backend.onrender.com/api/watchlist/add`,
      { stocksymbol: finalSymbol },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const newList = [
      ...watchlist,
      { stocksymbol: finalSymbol, addTime: new Date().toISOString() }
    ];

    setWatchlist(newList);

    localStorage.setItem(
      "watchlistOrder",
      JSON.stringify(newList.map((i) => i.stocksymbol))
    );

    setSymbol("");
    setSuggestions([]);
  };

  /* ---------------- REMOVE ---------------- */

  const handleRemove = async (symbolToRemove) => {
    const token = localStorage.getItem("token");

    await axios.post(
      `https://stocksimulator-backend.onrender.com/api/watchlist/remove`,
      { stocksymbol: symbolToRemove },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const updated = watchlist.filter(
      (i) => i.stocksymbol !== symbolToRemove
    );

    setWatchlist(updated);

    localStorage.setItem(
      "watchlistOrder",
      JSON.stringify(updated.map((i) => i.stocksymbol))
    );
  };

  /* ---------------- DRAG REORDER ---------------- */

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(watchlist);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    setWatchlist(items);

    localStorage.setItem(
      "watchlistOrder",
      JSON.stringify(items.map((i) => i.stocksymbol))
    );
  };

  return (
    <div className="watchlist-container">
      <h2>Watchlist</h2>

      <div className="watchlist-add">
        <input
          type="text"
          placeholder="Search stock..."
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
        />

        <button onClick={() => handleAdd()}>
          <FiPlusCircle /> Add
        </button>
      </div>

      {symbol && suggestions.length > 0 && (
        <motion.div
          className="suggestions-dropdown"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {suggestions.map((stock, index) => (
            <div
              key={stock.symbol}
              className={`suggestion-item ${
                index === activeIndex ? "active" : ""
              }`}
              onClick={() => handleAdd(stock.symbol)}
            >
              <strong>{stock.symbol}</strong>
              <span>{stock.companyname}</span>
            </div>
          ))}
        </motion.div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="watchlist">
          {(provided) => (
            <div
              className="watchlist-list"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {watchlist.map((item, index) => (
                <Draggable
                  key={item.stocksymbol}
                  draggableId={item.stocksymbol}
                  index={index}
                >
                  {(provided) => (
                    <div
                      className="stock-card"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="stock-card-header">
                        <div>
                          <div className="symbol">
                            {item.stocksymbol}
                          </div>
                          <div className="company">
                            {companyMap[item.stocksymbol]}
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            handleRemove(item.stocksymbol)
                          }
                        >
                          <FiTrash />
                        </button>
                      </div>

                      <LivePrice symbol={item.stocksymbol} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default WatchList;