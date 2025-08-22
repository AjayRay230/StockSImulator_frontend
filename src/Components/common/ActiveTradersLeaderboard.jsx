import { useState } from "react";
import { FaChartBar, FaTable, FaMedal, FaUsers } from "react-icons/fa";
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

export default function ActiveTradersLeaderboard({ activeTraders = [] }) {  
  const [view, setView] = useState("chart");

  const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

  return (
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
  );
}
