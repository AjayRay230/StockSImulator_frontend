import { useEffect, useState } from "react";
import axios from "axios";
import {
  Sparklines,
  SparklinesBars,
  SparklinesLine,
  
} from "react-sparklines";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";
import  {toast} from "react-toastify";
import {  FaSpinner,FaMoon ,FaSun} from "react-icons/fa";
import Chart from 'react-apexcharts';
import apiClient from "../../api/apiClient";
const LivePrice = ({ symbol }) => {
  const[darkMode,setDarkMode] = useState(null);
  const[chartType,setChartType] = useState("line");
  const[dateRange,setDateRange] = useState("1D");
  const[lastUpdated,setLastUpdated] = useState(null);
  const [data, setData] = useState(null);
  const[secondAgo,setSecondAgo] = useState(0);
  
    const fetchPrice = async () => {
  try {
    const res = await apiClient.get("/api/stock-price/price", {
      params: {
        stocksymbol: symbol,
        range: dateRange,
      },
    });

    setSecondAgo(0);
    setData(res.data[0]);
    setLastUpdated(new Date().toLocaleDateString());

  } catch (err) {
    toast.error("Live Price error");
    toast.warn("Live Price Error...");
  }
};

  useEffect(() => {
    
    fetchPrice();
  //  const secInterval = setInterval(()=>{
  //   setSecondAgo((s)=>s+1);
  //  },1000);
  //   return () => clearInterval(secInterval);
  }, [symbol,dateRange]);

  if (!data) return <span style={{textAlign:"center"}}>Loading...{" "}<FaSpinner className="icons-spin"/></span>;
 const{currentPrice,change,changePercent,trend,sparkline,highPrice,lowPrice,volume,previousClose,fiftyTwoWeekHigh,fiftyTwoWeekLow,openPrice} = data;
  const isUp = trend === "up";
  const prices = sparkline?.map((point) => point.openPrice) || [];
  
  const movingAvg = prices.map((_,i,arr)=>{
    const slice = arr.slice(Math.max(0,i-4),i+1);
    return slice.reduce((a,b)=>a+b,0)/slice.length;
  });
   const candleData = sparkline?.map((point)=>({
  x:new Date(point.date).getTime(),
  y:[
    point.openPrice,
    point.highPrice,
    point.lowPrice,
    point.closePrice
  ]
   }))||[];
  //  const profitLoss =(currentPrice-OpenPrice)*quantity;
  //  const profitLossPercentage = ((currentPrice-OpenPrice)/OpenPrice)*100;
  return (
  <div className={`live-card ${darkMode ? "dark" : ""}`}>
    
    {/* HEADER */}
    <div className="live-header">
      <div className="symbol-block">
        <span className="ticker">{symbol}</span>
        {isUp ? (
          <FiTrendingUp className="trend up" />
        ) : (
          <FiTrendingDown className="trend down" />
        )}
      </div>

      <button className="mode-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>
    </div>

    {/* PRICE */}
    <motion.div
      className={`live-price ${isUp ? "up" : "down"}`}
      key={currentPrice}
      initial={{ opacity: 0.6, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      ${currentPrice.toFixed(2)}
      <span className="live-change">
        {change > 0 ? "+" : ""}
        {change.toFixed(2)} ({changePercent.toFixed(2)}%)
      </span>
    </motion.div>

    {/* MARKET DATA GRID */}
    <div className="market-grid">
      <div><span>Open</span><b>${openPrice?.toFixed(2) || "--"}</b></div>
      <div><span>Prev Close</span><b>${previousClose?.toFixed(2) || "--"}</b></div>
      <div><span>52W High</span><b>${fiftyTwoWeekHigh?.toFixed(2) || "--"}</b></div>
      <div><span>52W Low</span><b>${fiftyTwoWeekLow?.toFixed(2) || "--"}</b></div>
    </div>

    {/* RANGE + TYPE */}
    <div className="control-row">
      <div className="range-selector">
        {["1D","5D","1M","1Y","MAX"].map(r => (
          <button
            key={r}
            onClick={() => setDateRange(r)}
            className={dateRange === r ? "active" : ""}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="chart-switch">
        <button
          className={chartType === "line" ? "active" : ""}
          onClick={() => setChartType("line")}
        >
          Line
        </button>
        <button
          className={chartType === "candlestick" ? "active" : ""}
          onClick={() => setChartType("candlestick")}
        >
          Candle
        </button>
      </div>
    </div>

    {/* CHART */}
    <div className="chart-area">
      {chartType === "line" && (
        <>
          <Sparklines data={prices} height={180}>
            <SparklinesLine
              style={{
                stroke: isUp ? "#00E396" : "#FF4D4F",
                strokeWidth: 2.2
              }}
            />
          </Sparklines>

          <Sparklines data={volume || []} height={60}>
            <SparklinesBars style={{ fill: "#334155" }} />
          </Sparklines>
        </>
      )}

      {chartType === "candlestick" && (
        <Chart
          options={{
            chart: {
              type: "candlestick",
              background: "transparent",
              toolbar: { show: false }
            },
            grid: {
              borderColor: "rgba(255,255,255,0.06)"
            },
            xaxis: { type: "datetime" },
            yaxis: { opposite: true }
          }}
          series={[{ name: "Price", data: candleData }]}
          type="candlestick"
          height={220}
        />
      )}
    </div>

    {/* FOOTER */}
    <div className="live-footer">
      Updated {secondAgo}s ago
    </div>

  </div>
);
};

export default LivePrice; 