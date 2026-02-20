import { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";
import { useWebSocket } from "../../context/WebSocketContext";
import StockPrice from "./StockPrice";
import TradeHeader from "../Trade/TradeHeader";
import StockSelector from "./StockSelector";
import SimulateStock from "./SimulateStock";
import OrderBook from "./OrderBook";
import { useLocation } from "react-router-dom";

const StockDashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [refreshKey, setRefreshKey] = useState(0);

  // NEW — Closing price stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Existing metrics
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const { portfolioValue } = useWebSocket();
  const location = useLocation();

  // Sync symbol from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const symbolFromUrl = params.get("symbol");
    if (symbolFromUrl) {
      setSelectedSymbol(symbolFromUrl);
    }
  }, [location]);


  // Fetch closing-price (CHART + STATS)

  useEffect(() => {
    const fetchClosingPrice = async () => {
      try {
        setStatsLoading(true);

        const response = await apiClient.get(
          "/api/stock-price/closing-price",
          {
            params: { stocksymbol: selectedSymbol, range: "1D" }
          }
        );

        setStats(response.data);
      } catch (err) {
        console.error("Closing price fetch error:", err);
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchClosingPrice();
  }, [selectedSymbol, refreshKey]);


  // Fetch dashboard metrics

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        setMetricsLoading(true);

        const response = await apiClient.get(
          "/api/user/me/dashboard-metrics",
          { params: { symbol: selectedSymbol } }
        );

        setMetrics(response.data);
      } catch (err) {
        console.error("Dashboard metrics fetch error:", err);
        setMetrics(null);
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, [selectedSymbol, refreshKey]);

  
  // Derived Market Stats
  
  const candles = stats?.data || [];

  const high =
    candles.length > 0
      ? Math.max(...candles.map(d => d.highPrice)).toFixed(2)
      : "--";

  const low =
    candles.length > 0
      ? Math.min(...candles.map(d => d.lowPrice)).toFixed(2)
      : "--";

  const volume =
    candles.length > 0
      ? candles[0]?.volume?.toLocaleString()
      : "--";
    const formatMarketCap = (value) => {
  if (!value || value === 0) return "--";

  if (value >= 1_000_000_000_000)
    return (value / 1_000_000_000_000).toFixed(2) + "T";

  if (value >= 1_000_000_000)
    return (value / 1_000_000_000).toFixed(2) + "B";

  if (value >= 1_000_000)
    return (value / 1_000_000).toFixed(2) + "M";

  return value.toFixed(2);
};
  return (
    <div className="trade-terminal">

      {/* ===== HEADER ===== */}
      <div className="terminal-header">
        <TradeHeader symbol={selectedSymbol} />
        <StockSelector
          selectedSymbol={selectedSymbol}
          onChange={setSelectedSymbol}
        />
      </div>

      {/*  MARKET QUICK STATS  */}
      <div className="terminal-stats">
        <div className="stat-card">
          <span>High</span>
          <strong>{statsLoading ? "..." : high}</strong>
        </div>

        <div className="stat-card">
          <span>Low</span>
          <strong>{statsLoading ? "..." : low}</strong>
        </div>

        <div className="stat-card">
          <span>Volume</span>
          <strong>{statsLoading ? "..." : volume}</strong>
        </div>

            <div className="stat-card">
              <span>Market Cap</span>
              <strong>
                {metricsLoading
                  ? "..."
                  : metrics?.marketCap
                  ? formatMarketCap(metrics.marketCap)
                  : "--"}
              </strong>
            </div>
      </div>

      {/* BODY */}
      <div className="terminal-body">

        <div className="terminal-chart">
          <StockPrice
            symbol={selectedSymbol}
            stats={stats}            //  pass chart data
            loading={statsLoading}
            refreshKey={refreshKey}
            onSimulate={() =>
              setRefreshKey(prev => prev + 1)
            }
          />
        </div>

        <div className="terminal-side-panel">

          <div className="trade-box">
            <SimulateStock
              symbol={selectedSymbol}
              onSimulate={() =>
                setRefreshKey(prev => prev + 1)
              }
            />
          </div>

          <div className="orderbook-box">
            <OrderBook symbol={selectedSymbol} />
          </div>

        </div>

      </div>

      {/* FOOTER  */}
      <div className="terminal-footer">
        <div>
          Position:{" "}
          {metricsLoading
            ? "..."
            : metrics
            ? metrics.quantity
            : "--"}
        </div>

        <div>
          Unrealized P&L:{" "}
          <span
            style={{
              color:
                metrics && metrics.unrealizedPnL >= 0
                  ? "limegreen"
                  : "red"
            }}
          >
            {metricsLoading
              ? "..."
              : metrics
              ? metrics.unrealizedPnL.toFixed(2)
              : "--"}
          </span>
        </div>

        <div>
          Exposure (Portfolio):{" "}
          {portfolioValue !== null
            ? portfolioValue.toFixed(2)
            : metrics
            ? metrics.portfolioValue.toFixed(2)
            : "--"}
        </div>

        <div>
          Trades Today:{" "}
          {metricsLoading
            ? "..."
            : metrics
            ? metrics.tradesToday
            : "--"}
        </div>
      </div>

    </div>
  );
};

export default StockDashboard;
