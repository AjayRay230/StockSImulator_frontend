import React, { useEffect, useState } from "react";
import "./AdminTradeStats.css";
import apiClient from "../../api/apiClient";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
  LineChart,
  Line,
} from "recharts";

import {
  FaUsers,
  FaClock,
  FaChartLine,
  FaCheckCircle,
} from "react-icons/fa";


const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

/* ---------- Sparkline ---------- */
const Sparkline = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={safeData}>
        <Line
          type="monotone"
          dataKey="price"
          stroke="#00d4ff"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const AdminTradeStats = () => {
  const [activeTraders, setActiveTraders] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [topStocks, setTopStocks] = useState([]);
  const [executedTrades, setExecutedTrades] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
  try {
    const [tradersRes, recentRes, topRes, executedRes] =
      await Promise.all([
        apiClient.get("/api/transaction/active-traders", {
          params: { limit: 5 },
        }),
        apiClient.get("/api/transaction/recent", {
          params: { limit: 10 },
        }),
        apiClient.get("/api/transaction/top-stocks", {
          params: { limit: 5 },
        }),
        apiClient.get("/api/transaction/executed", {
          params: { limit: 5 },
        }),
      ]);

    setActiveTraders(
      Array.isArray(tradersRes.data) ? tradersRes.data : []
    );
    setRecentTrades(
      Array.isArray(recentRes.data) ? recentRes.data : []
    );
    setTopStocks(
      Array.isArray(topRes.data) ? topRes.data : []
    );
    setExecutedTrades(
      Array.isArray(executedRes.data) ? executedRes.data : []
    );

    setError(null);

  } catch (err) {
    console.error("AdminTradeStats fetch error:", err);
    setError("Failed to load trading data. Please try again.");
  } finally {
    setLoading(false);
  }
};

  /* ---------- Safe Normalization ---------- */
  const traders = Array.isArray(activeTraders) ? activeTraders : [];
  const recent = Array.isArray(recentTrades) ? recentTrades : [];
  const stocks = Array.isArray(topStocks) ? topStocks : [];
  const executed = Array.isArray(executedTrades) ? executedTrades : [];
  console.log("Active Traders API Response:", traders.data);
  /* ---------- UI STATES ---------- */
  if (loading) {
    return (
      <div className="terminal-loading">
        Loading trading terminal...
      </div>
    );
  }

  if (error) {
    return (
      <div className="terminal-error">
        {error}
      </div>
    );
  }

  return (
    <div className="terminal-container">

      {/* HEADER */}
      <div className="terminal-header">
        <h1>Admin Trading Terminal</h1>
        <span className="live-indicator">LIVE</span>
      </div>

      <div className="terminal-grid">

        {/* LEFT PANEL */}
        <div className="terminal-main">

          {/* Active Traders */}
          <div className="terminal-card large">
            <div className="card-title">
              <FaUsers /> Active Traders
            </div>

            {traders.length === 0 ? (
              <div className="empty-state">No trader activity today.</div>
            ) : (
<ResponsiveContainer width="100%" height={220}>
  <BarChart
    data={traders}
    layout="vertical"
    margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
  >
    <defs>
      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#00d4ff" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>

    <XAxis
      type="number"
      tick={{ fill: "#64748b", fontSize: 12 }}
      axisLine={false}
      tickLine={false}
    />

    <YAxis
      dataKey="username"
      type="category"
      width={120}
      tick={{
        fill: "#e2e8f0",
        fontSize: 13,
        fontWeight: 500
      }}
      axisLine={false}
      tickLine={false}
    />

    <Bar
      dataKey="tradeCount"
      fill="url(#barGradient)"
      radius={[6, 6, 6, 6]}
      barSize={18}
    >
      {/* THIS makes values always visible */}
      <LabelList
        dataKey="tradeCount"
        position="right"
        fill="#ffffff"
        fontSize={13}
        fontWeight={600}
      />
    </Bar>
  </BarChart>
</ResponsiveContainer>

            )}
          </div>

          {/* Recent Trades */}
          <div className="terminal-card">
            <div className="card-title">
              <FaClock /> Recent Trades
            </div>

            <table className="terminal-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Stock</th>
                  <th>Qty</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      No recent trades.
                    </td>
                  </tr>
                ) : (
                  recent.map((trade, i) => (
                    <tr key={i}>
                      <td>{trade.username}</td>
                      <td>{trade.stockSymbol}</td>
                      <td>{trade.quantity}</td>
                      <td>
                        <span
                          className={`trade-badge ${
                            trade.type === "BUY" ? "buy" : "sell"
                          }`}
                        >
                          {trade.type}
                        </span>
                      </td>
                      <td>{trade.currentPrice}</td>
                      <td>
                        {(
                          (trade.currentPrice || 0) *
                          (trade.quantity || 0)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="terminal-side">

          {/* Top Stocks */}
          <div className="terminal-card">
            <div className="card-title">
              <FaChartLine /> Top Stocks
            </div>

            {stocks.length === 0 ? (
              <div className="empty-state">No stock activity.</div>
            ) : (
              stocks.map((stock, i) => (
                <div key={i} className="stock-row">
                  <div>
                    <div className="stock-symbol">
                      {stock.stockSymbol}
                    </div>
                    <div className="stock-count">
                      {stock.tradeCount} trades
                    </div>
                  </div>
                  <Sparkline data={stock.trendData} />
                </div>
              ))
            )}
          </div>

          {/* Execution Feed */}
          <div className="terminal-card">
            <div className="card-title">
              <FaCheckCircle /> Execution Feed
            </div>

            {executed.length === 0 ? (
              <div className="empty-state">No executions today.</div>
            ) : (
              executed.map((trade, i) => (
                <div key={i} className="execution-row">
                  <div className="execution-symbol">
                    {trade.stockSymbol}
                  </div>
                  <div className="execution-count">
                    {trade.tradeCount} trades
                  </div>
                  <div className="execution-time">
                    {trade.timestamp
                      ? new Date(trade.timestamp).toLocaleTimeString()
                      : "-"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminTradeStats;
