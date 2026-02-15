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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{
        opacity: 0,
        x: -50,
        backgroundColor: "#330000"
      }}
      transition={{ duration: 0.3 }}
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
  const [loading, setLoading] = useState(false);

  const [confirmStock, setConfirmStock] = useState(null);
  const [toast, setToast] = useState(null);
  const undoRef = useRef(null);

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

      if (!symbols.length) {
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

  /* ================= REMOVE LOGIC ================= */

  const confirmRemove = (stock) => {
    setConfirmStock(stock);
  };

  const executeRemove = async () => {
    if (!confirmStock) return;

    const stockToRemove = confirmStock;
    setConfirmStock(null);

    // Optimistic removal
    setStocks((prev) =>
      prev.filter((s) => s.stocksymbol !== stockToRemove.stocksymbol)
    );

    if (selected === stockToRemove.stocksymbol) {
      setSelected(null);
    }

    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `https://stocksimulator-backend.onrender.com/api/watchlist/remove`,
        { stocksymbol: stockToRemove.stocksymbol },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Toast with Undo
      setToast({
        message: `${stockToRemove.stocksymbol} removed`,
        stock: stockToRemove
      });

      undoRef.current = setTimeout(() => {
        setToast(null);
      }, 5000);

    } catch (err) {
      console.error(err);
      fetchWatchlist();
    }
  };

  const undoRemove = async () => {
    if (!toast?.stock) return;

    clearTimeout(undoRef.current);

    const token = localStorage.getItem("token");

    await axios.post(
      `https://stocksimulator-backend.onrender.com/api/watchlist/add`,
      { stocksymbol: toast.stock.stocksymbol },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchWatchlist();
    setToast(null);
  };

  /* ================= DRAG ================= */

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

  return (
    <div className="terminal-layout">
      <div className="watchlist-panel">
        <h3>WATCHLIST</h3>

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
                  onRemove={confirmRemove}
                  expanded={selected === stock.stocksymbol}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      </div>

      <div className="chart-panel">
        {selected ? (
          <StockPrice symbol={selected} />
        ) : (
          <div className="placeholder">Select a stock</div>
        )}
      </div>

      {/* ================= CONFIRM MODAL ================= */}
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
                Remove <strong>{confirmStock.stocksymbol}</strong> from
                watchlist?
              </p>
              <div className="modal-actions">
                <button onClick={() => setConfirmStock(null)}>Cancel</button>
                <button className="danger" onClick={executeRemove}>
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= TOAST ================= */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            {toast.message}
            <button onClick={undoRemove}>Undo</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WatchList;