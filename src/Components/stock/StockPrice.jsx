import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import { toast } from "react-toastify";
import { FaMoon, FaSpinner, FaSun } from "react-icons/fa";
import SimulateStock from "./SimulateStock";
import { WebSocketContext } from "../../context/WebSocketContext";
import { useContext } from "react";

const calculateSMA = (data, period) => {
  return data.map((_, idx, arr) => {
    if (idx < period - 1) return { x: arr[idx].x, y: null };
    const slice = arr.slice(idx - period + 1, idx + 1);
    const avg = slice.reduce((sum, val) => sum + val.y, 0) / slice.length;
    return { x: arr[idx].x, y: avg };
  });
};

const calculateEMA = (data, period) => {
  let ema = [];
  let multiplier = 2 / (period + 1);
  let sum = 0;

  data.forEach((point, idx) => {
    if (idx < period) {
      sum += point.y;
      ema.push({ x: point.x, y: null });
      if (idx === period - 1) {
        const sma = sum / period;
        ema[idx] = { x: point.x, y: sma };
      }
    } else {
      const prevEma = ema[idx - 1];
      const newEma =
        (point.y - prevEma.y) * multiplier + prevEma.y;
      ema.push({ x: point.x, y: newEma });
    }
  });

  return ema;
};

const StockPrice = ({ symbol, onBack, refreshKey, onSimulate }) => {
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [chartType, setChartType] = useState("line");
  const [dateRange, setDateRange] = useState("1D");
  const [ohlcData, setOhlcData] = useState([]);
  const [companyName, setCompanyName] = useState("");
 const { latestUpdate } = useContext(WebSocketContext);
const livePrice = latestUpdate?.[symbol]
  ? parseFloat(latestUpdate[symbol])
  : null;

  // ---------------- FETCH ----------------
  useEffect(() => {
    if (!symbol) return;

    const fetchPrice = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `https://stocksimulator-backend.onrender.com/api/stock-price/closing-price?stocksymbol=${symbol}&range=${dateRange}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const apiData = response.data;

        const normalized =
          (apiData.data || []).map((item) => ({
            ...item,
            timestamp: new Date(item.timestamp),
            openPrice: parseFloat(item.openPrice),
            highPrice: parseFloat(item.highPrice),
            lowPrice: parseFloat(item.lowPrice),
            closePrice: parseFloat(item.closePrice),
            volume: parseFloat(item.volume)
          })) || [];

        setOhlcData(normalized);

        const fullName =
          apiData?.meta?.companyname ||
          apiData?.meta?.symbol ||
          symbol;

        setCompanyName(fullName);
      } catch (error) {
        toast.error("Error while getting the price");
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [symbol, dateRange, refreshKey]);

  // ---------------- DERIVED DATA ----------------

  const closePriceData = useMemo(() => {
    return ohlcData
      .map((item) => ({
        x: item.timestamp,
        y: item.closePrice
      }))
      .filter((d) => !isNaN(d.y));
  }, [ohlcData]);

  const ma20 = useMemo(
    () => calculateSMA(closePriceData, 20),
    [closePriceData]
  );

  const ema20 = useMemo(
    () => calculateEMA(closePriceData, 20),
    [closePriceData]
  );

const candleStickData = useMemo(() => {
  if (!ohlcData.length) return [];

  const base = ohlcData.map((item) => ({
    x: item.timestamp,
    y: [
      item.openPrice,
      item.highPrice,
      item.lowPrice,
      item.closePrice
    ]
  }));

  // If no live price or not in candlestick mode → return base
  if (!livePrice || chartType !== "candlestick") {
    return base;
  }

  const bucketSize = 60 * 1000;
  const now = Date.now();
  const currentBucket = Math.floor(now / bucketSize) * bucketSize;

  const last = base[base.length - 1];
  const lastTime = new Date(last.x).getTime();

  // SAME BUCKET → clone and update last
  if (lastTime === currentBucket) {
    const updated = {
      ...last,
      y: [
        last.y[0],
        Math.max(last.y[1], livePrice),
        Math.min(last.y[2], livePrice),
        livePrice
      ]
    };

    return [...base.slice(0, -1), updated];
  }

  // NEW BUCKET → append
  if (currentBucket > lastTime) {
    return [
      ...base,
      {
        x: new Date(currentBucket),
        y: [livePrice, livePrice, livePrice, livePrice]
      }
    ];
  }

  return base;

}, [ohlcData, livePrice, chartType]);



  const volumeSeries = useMemo(() => {
    return [
      {
        name: "Volume",
        data: ohlcData.map((item) => ({
          x: item.timestamp,
          y: item.volume
        }))
      }
    ];
  }, [ohlcData]);

  const series = useMemo(() => {
    if (!ohlcData.length) return [];

    let mainSeries = [];

    if (chartType === "candlestick") {
      mainSeries.push({
        name: "Price",
        type: "candlestick",
        data: candleStickData
      });
    } else {
      mainSeries.push({
        name: "Price",
        type: chartType,
        data: closePriceData
      });
    }

    mainSeries.push(
      { name: "MA 20", type: "line", data: ma20 },
      { name: "EMA 20", type: "line", data: ema20 }
    );

    return mainSeries;
  }, [
    chartType,
    candleStickData,
    closePriceData,
    ma20,
    ema20,
    ohlcData.length
  ]);

  // ---------------- CHART OPTIONS ----------------

  const options = useMemo(() => ({
  chart: {
    type: chartType,
    height: 400,
    background: "transparent",
    toolbar: { show: true, tools: { download: false } },
    zoom: { enabled: true }
  },
    theme: { mode: darkMode ? "dark" : "light" },
    grid: {
      borderColor: darkMode
        ? "rgba(255,255,255,0.06)"
        : "#e5e7eb",
      strokeDashArray: 3
    },
    colors: ["#00E396", "#FFD700", "#00C8FF"],
    stroke: {
      width: 2,
      curve: "smooth"
    },
    xaxis: { type: "datetime" },
    yaxis: { opposite: true },
    tooltip: {
      shared: true,
      theme: darkMode ? "dark" : "light",
      x: { format: "dd MMM HH:mm" }
    },
    dataLabels: { enabled: false },
    title: {
      text: companyName || symbol,
      align: "left",
      style: {
        fontSize: "20px",
        fontWeight: "700"
      }
    }
  }), [darkMode, companyName, symbol]);

  const volumeOptions = useMemo(() => ({
    chart: {
      type: "bar",
      height: 120,
      background: "transparent",
      toolbar: { show: false }
    },
    grid: { show: false },
    plotOptions: {
      bar: { columnWidth: "70%", borderRadius: 2 }
    },
    xaxis: { type: "datetime", labels: { show: false } },
    yaxis: { labels: { show: false } },
    tooltip: { theme: darkMode ? "dark" : "light" }
  }), [darkMode]);

  // ---------------- RENDER ----------------

  if (loading) {
    return (
      <span>
        Loading... <FaSpinner className="icons-spin" />
      </span>
    );
  }

  if (!series.length || !series[0]?.data?.length) {
    return <div>No data available</div>;
  }

  return (
    <div className={`chart-card ${darkMode ? "dark" : ""}`}>
      <div className="chart-header">
        <div className="left-controls">
          <SimulateStock onSimulate={onSimulate} />
          {onBack && (
            <button onClick={onBack} className="back-btn">
              ← Back
            </button>
          )}
        </div>

        <div className="center-controls">
          <div className="range-selector">
            {["1D", "5D", "1M", "1Y", "MAX"].map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={dateRange === r ? "active" : ""}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="right-controls">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="chart-type-select"
          >
            <option value="candlestick">Candlestick</option>
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="bar">Bar</option>
          </select>

          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </div>

      <Chart
        options={options}
        series={series}
        type={chartType}
        height={400}
        
      />

      <Chart
        options={volumeOptions}
        series={volumeSeries}
        type="bar"
        height={120}
      />
    </div>
  );
};

export default StockPrice;