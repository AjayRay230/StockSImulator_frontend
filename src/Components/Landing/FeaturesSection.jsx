import { FaChartLine, FaFlask, FaStar, FaChartPie } from "react-icons/fa";

const features = [
  {
    title: "Low-Latency Market Data Feed",
    description:
      "Continuously streamed equity price data engineered for minimal latency and high-frequency state synchronization across the trading engine.",
    icon: <FaChartLine />,
  },
  {
    title: "Deterministic Trade Execution Engine",
    description:
      "Order execution logic modeled to simulate real-market conditions, including position updates, capital constraints, and execution consistency.",
    icon: <FaFlask />,
  },
  {
    title: "Real-Time Portfolio State Tracking",
    description:
      "Mark-to-market valuation with continuous P&L recalculation, capital exposure monitoring, and allocation-level visibility.",
    icon: <FaChartPie />,
  },
  {
    title: "Signal-Focused Watchlist Architecture",
    description:
      "Structured asset monitoring for rapid signal validation and volatility-aware observation across selected instruments.",
    icon: <FaStar />,
  },
];
