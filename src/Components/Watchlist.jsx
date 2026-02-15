import { useEffect, useState } from "react";
import { useUser } from "../context/userContext";
import axios from "axios";
import { motion } from "framer-motion";
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

  useEffect(() => {
    if (!user) return;

    const fetchWatchlist = async () => {
      const token = localStorage.getItem("token");

      const listRes = await axios.get(
        `https://stocksimulator-backend.onrender.com/api/watchlist/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const symbols = listRes.data.map((s) => s.stocksymbol);

      const liveRes = await axios.get(
        `https://stocksimulator-backend.onrender.com/api/stock-price/batch-live`,
        {
          params: { symbols },
              paramsSerializer: params => {
      return params.symbols.map(s => `symbols=${s}`).join(".");
    },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStocks(liveRes.data);
    };

    fetchWatchlist();
  }, [user]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = stocks.findIndex((s) => s.stocksymbol === active.id);
      const newIndex = stocks.findIndex((s) => s.stocksymbol === over.id);
      const updated = [...stocks];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      setStocks(updated);
    }
  };

  const gainers = stocks.filter((s) => s.percentChange > 0);
  const losers = stocks.filter((s) => s.percentChange <= 0);

  return (
    <div className="terminal-layout">
      <div className="watchlist-panel">
        <h3>WATCHLIST</h3>

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
            <div key={s.symbol} className="mini-row positive">
              {s.symbol} +{Number(s.percentChange).toFixed(2)}%
            </div>
          ))}

          <h4>LOSERS</h4>
          {losers.map((s) => (
            <div key={s.symbol} className="mini-row negative">
              {s.symbol} {Number(s.percentChange).toFixed(2)}%
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