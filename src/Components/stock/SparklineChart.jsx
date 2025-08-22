import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

const SparklineChart = ({ sparklineData }) => {
  // Format the data for Recharts
  const formattedData = sparklineData.map((point, index) => ({
    name: point.timestamp.slice(11, 16), // Extract time (HH:MM)
    value: parseFloat(point.openPrice),
  }));

  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={formattedData}>
        <XAxis dataKey="name" hide /> {/* Hide x-axis if not needed */}
        <Tooltip
          contentStyle={{ fontSize: "12px" }}
          formatter={(value) => [`$${value.toFixed(2)}`, "Price"]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#4CAF50"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SparklineChart;
