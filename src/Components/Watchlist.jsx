import { useEffect, useState, useCallback } from "react";
import { useUser } from "../context/userContext";
import axios from "axios";
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
    <div
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
    </div>
  );
};

const WatchList = () => {
  const { user } = useUser();
  const [stocks, setStocks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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
      console.error("Error fetching watchlist:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // 🔁 Auto refresh every 15 seconds
  // useEffect(() => {
  //   if (!user) return;

  //   const interval = setInterval(fetchWatchlist, 15000);
  //   return () => clearInterval(interval);
  // }, [fetchWatchlist, user]);

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


const filteredStocks = search.trim() === ""
  ? stocks
  : stocks.filter((s) => {
      const symbol = s.stocksymbol?.toLowerCase() || "";
      const name = s.companyname?.toLowerCase() || "";
      const query = search.toLowerCase();
      return symbol.includes(query) || name.includes(query);
    });

  const gainers = filteredStocks.filter((s) => s.percentChange > 0);
  const losers = filteredStocks.filter((s) => s.percentChange <= 0);

  return (
    <div className="terminal-layout">
      <div className="watchlist-panel">
        <h3>WATCHLIST</h3>

        <input
          type="text"
          placeholder="Search symbol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        {loading && <div className="loading">Updating prices...</div>}

        {filteredStocks.length === 0 && !loading && (
          <div className="empty-state">No stocks found</div>
        )}

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={stocks.map((s) => s.stocksymbol)}
            strategy={verticalListSortingStrategy}
          >
            {stocks.map((stock) => (
              <SortableRow
                key={stock.stocksymbol}
                stock={stock}
                onClick={setSelected}
                expanded={selected === stock.stocksymbol}
              />
            ))}
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