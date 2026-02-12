import { useState } from "react";
import {
  FaChartBar,
  FaTable,
  FaMedal,
  FaUsers
} from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

import "./ActiveTradersLeaderboard.css";

export default function ActiveTradersLeaderboard({ activeTraders = [] }) {
  const [view, setView] = useState("chart");

  const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

  return (
    <div className="leaderboard-card">

      {/* Header */}
      <div className="leaderboard-header">
        <div className="leaderboard-title">
          <FaUsers className="leaderboard-icon" />
          <h2>Active Traders Leaderboard</h2>
        </div>

        <div className="leaderboard-tabs">
          <button
            className={`leaderboard-tab-btn ${
              view === "chart" ? "active" : ""
            }`}
            onClick={() => setView("chart")}
          >
            <FaChartBar /> Chart
          </button>

          <button
            className={`leaderboard-tab-btn ${
              view === "table" ? "active" : ""
            }`}
            onClick={() => setView("table")}
          >
            <FaTable /> Table
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="leaderboard-content">

        {view === "chart" ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={activeTraders}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="userName"
                type="category"
                width={100}
                tick={{ fill: "#9ca3af" }}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{
                  background: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff"
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
        ) : (
          <div className="leaderboard-table-container">
            <table className="leaderboard-table">
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
                          size={18}
                          color={medalColors[index]}
                        />
                      ) : (
                        <span className="leaderboard-rank">
                          #{index + 1}
                        </span>
                      )}
                    </td>

                    <td className="leaderboard-username">
                      {trader.userName}
                    </td>

                    <td className="leaderboard-email">
                      {trader.email}
                    </td>

                    <td>
                      <span className="leaderboard-badge">
                        {trader.tradeCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
