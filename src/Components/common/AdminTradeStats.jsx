import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaClock, FaChartLine, FaCheckCircle, FaChartBar, FaTable, FaMedal } from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, LabelList
} from "recharts";

import { UserContext } from "../../context/userContext";
const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
const Sparkline = ({ data }) => {
  return (
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
};

const AdminTradeStats = () => {
  const [activeTraders, setActiveTraders] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [topStocks, setTopStocks] = useState([]);
  const [executedTrades, setExecutedTrades] = useState([]);
  const[view ,setView] = useState("chart");
  const {user} = UserContext;
  useEffect(() => {
    fetchActiveTraders();
    fetchRecentTrades();
    fetchTopStocks();
    fetchExecutedTrades();
  }, []);

  const fetchActiveTraders = async () => {
    try {
      const res = await axios.get("https://stocksimulator-backend.onrender.com/api/transaction/active-traders?limit=5", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setActiveTraders(res.data);
    } catch (err) {
      console.error("Error fetching active traders", err);
    }
  };

  const fetchRecentTrades = async () => {
    try {
      const res = await axios.get("https://stocksimulator-backend.onrender.com/api/transaction/recent?limit=10", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRecentTrades(res.data);
    } catch (err) {
      console.error("Error fetching recent trades", err);
    }
  };

  const fetchTopStocks = async () => {
    try {
      const res = await axios.get("https://stocksimulator-backend.onrender.com/api/transaction/top-stocks?limit=5", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTopStocks(res.data);
    } catch (err) {
      console.error("Error fetching top stocks", err);
    }
  };

  const fetchExecutedTrades = async () => {
    try {
      const res = await axios.get("https://stocksimulator-backend.onrender.com/api/transaction/executed?limit=5", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setExecutedTrades(res.data);
    } catch (err) {
      console.error("Error fetching executed trades", err);
    }
  };

  return (
    <div className="admin-trade-stats">

      <div className="card">
           <div className="card-header">
             <FaUsers className="icon" />
             <h2> Active Traders Leaderboard</h2>
             <div className="tabs">
               <button
                 className={`tab-btn ${view === "chart" ? "active" : ""}`}
                 onClick={() => setView("chart")}
               >
                 <FaChartBar /> Chart
               </button>
               <button
                 className={`tab-btn ${view === "table" ? "active" : ""}`}
                 onClick={() => setView("table")}
               >
                 <FaTable /> Table
               </button>
             </div>
           </div>
     
           <div className="card-content">
             {view === "chart" ? (
               <ResponsiveContainer width="100%" height={250}>
                 <BarChart
                   data={activeTraders}
                   layout="vertical"
                   margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                 >
                   <XAxis type="number" hide />
                   <YAxis dataKey="userName" type="category" width={90} />
                   <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                   <Bar dataKey="tradeCount" radius={[0, 6, 6, 0]}>
                     {activeTraders.map((_, index) => (
                       <Cell
                         key={index}
                         fill={medalColors[index] || "#00d4ff"}
                       />
                     ))}
                     <LabelList dataKey="tradeCount" position="right" fill="#000" />
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="table-container">
                 <table>
                   <thead>
                     <tr>
                       <th>Rank</th>
                       <th>Trader</th>
                       <th>Email</th>
                       <th>Trades</th>
                     </tr>
                   </thead>
                   <tbody>
                     {activeTraders.map((trader, index) => (
                       <tr key={trader.userId || index}>
                         <td>
                           {index < 3 ? (
                             <FaMedal
                               size={20}
                               color={medalColors[index]}
                               title={`Rank ${index + 1}`}
                             />
                           ) : (
                             `#${index + 1}`
                           )}
                         </td>
                         <td>{trader.userName}</td>
                         <td>{trader.email}</td>
                         <td>
                           <span className="badge">{trader.tradeCount}</span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
           </div>
         </div>

      {/* Recent Trades */}
      <div className="card recent">
        <div className="card-header">
          <FaClock className="icon" />
          <h2>Recent Trades</h2>
        </div>
        <table className="recent-table">
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
  {recentTrades.map((trade, index) => (
    <tr key={index}>
      <td>{trade.username}</td>
      <td>{trade.stockSymbol}</td>
      <td>{trade.quantity}</td>
      <td>{trade.type}</td>
      <td>{trade.currentPrice}</td>
      <td>{(trade.currentPrice * trade.quantity).toFixed(2)}</td>
    </tr>
  ))}
  </tbody>
        </table>
      </div>

      {/* Top Stocks */}
      <div className="card top">
        <div className="card-header">
          <FaChartLine className="icon" />
          <h2>Top Stocks</h2>
        </div>
        <ul>
          {topStocks.map((stock, index) => (
            <li key={index}>
              <div className="stock-info">
                <span>{stock.stockSymbol}</span>
                <span className="badge">{stock.tradeCount} trades</span>
              </div>
              <Sparkline data={stock.trendData || []} />
            </li>
          ))}
        </ul>
      </div>

      {/* Executed Trades (Timeline) */}
      <div className="card executed">
        <div className="card-header">
          <FaCheckCircle className="icon" />
          <h2>Executed Trades</h2>
        </div>
        <div className="timeline">
          {executedTrades.map((trade, index) => (
            <div className="timeline-item" key={index}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <p>
                  <strong>{trade.username}</strong> executed{" "}
                  <span className="badge success">{trade.tradeCount}</span> trades
                </p>
                <small>{new Date(trade.timestamp).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminTradeStats;
