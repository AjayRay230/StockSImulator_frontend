import React, { useEffect, useState } from "react";
import "./AdminTradeStats.css";
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

const Sparkline = ({ data }) => (
  <ResponsiveContainer width="100%" height={40}>
    <LineChart data={data}>
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

const AdminTradeStats = () => {
  const [activeTraders, setActiveTraders] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [topStocks, setTopStocks] = useState([]);
  const [executedTrades, setExecutedTrades] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    try {
      const [traders, recent, top, executed] = await Promise.all([
        axios.get("/api/transaction/active-traders?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/transaction/recent?limit=10", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/transaction/top-stocks?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/transaction/executed?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setActiveTraders(traders.data);
      setRecentTrades(recent.data);
      setTopStocks(top.data);
      setExecutedTrades(executed.data);
    } catch (err) {
      console.error(err);
    }
  };

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

          {/* Leaderboard */}
          <div className="terminal-card large">
            <div className="card-title">
              <FaUsers /> Active Traders
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={activeTraders} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="userName"
                  type="category"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                <Bar dataKey="tradeCount" radius={[0, 6, 6, 0]}>
                  {activeTraders.map((_, index) => (
                    <Cell
                      key={index}
                      fill={medalColors[index] || "#00d4ff"}
                    />
                  ))}
                  <LabelList
                    dataKey="tradeCount"
                    position="right"
                    fill="#fff"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
                {Array.isArray(recentTrades) &&
              recentTrades.map((trade, i) => (

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
                      {(trade.currentPrice * trade.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
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

            {Array.isArray(topStocks) &&
              topStocks.map((stock, i) => (

              <div key={i} className="stock-row">
                <div>
                  <div className="stock-symbol">
                    {stock.stockSymbol}
                  </div>
                  <div className="stock-count">
                    {stock.tradeCount} trades
                  </div>
                </div>
                <Sparkline data={stock.trendData || []} />
              </div>
            ))}
          </div>

          {/* Execution Feed */}
          <div className="terminal-card">
            <div className="card-title">
              <FaCheckCircle /> Execution Feed
            </div>

            {Array.isArray(executedTrades) &&
            executedTrades.map((trade, i) => (

              <div key={i} className="execution-row">
                <div className="execution-symbol">
                  {trade.stockSymbol}
                </div>
                <div className="execution-count">
                  {trade.tradeCount} trades
                </div>
                <div className="execution-time">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminTradeStats;
