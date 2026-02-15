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
const LivePrice = ({ symbol }) => {
  const[darkMode,setDarkMode] = useState(null);
  const[chartType,setChartType] = useState("line");
  const[dateRange,setDateRange] = useState("1D");
  const[lastUpdated,setLastUpdated] = useState(null);
  const [data, setData] = useState(null);
  const[secondAgo,setSecondAgo] = useState(0);
  
    const fetchPrice = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `https://stocksimulator-backend.onrender.com/api/stock-price/price?stocksymbol=${symbol}&range=${dateRange}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      //  console.log("API response", res.data);
       setSecondAgo(0);
        setData(res.data[0]);
        setLastUpdated(new Date().toLocaleDateString());
      } catch (err) {
        toast.error("Live Price error:", err);
        toast.warn("Live Price Error... ");
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
    <div className={`card ${darkMode ?"dark" :""}`}>
      <div className="header">
      <div className="symbol">
        {isUp ? (
          <FiTrendingUp className="up" />
        ) : (
          <FiTrendingDown className="down" />
        )}
        <span>{symbol}</span>
        
      </div>
      <button className="mode-toggle" onClick={()=>setDarkMode(!darkMode)}>
        {darkMode ?<FaSun/>:<FaMoon/>}
      </button>
      </div>

      <motion.div
        className={`price ${isUp?"up":"down"}`}
        key={currentPrice}
        initial={{ opacity: 0.5,y:-5}}
        animate={{ opacity: 1,y:0 }}
        
        transition={{ duration: 0.3 }}
      >
        ${currentPrice.toFixed(2)}{" "}
        <span className="price-changes">
          ({data.change > 0 ? "+" : ""}
          {data.change.toFixed(2)}/{changePercent.toFixed(2)}%)
        </span>
      </motion.div>
      <div className="extra-data">
        <p>Open: $ {openPrice?.toFixed(2)||"_ _"}</p>
        <p>Previous Close: $ {previousClose?.toFixed(2)||"_ _"}</p>
         <p>52W High: $ {fiftyTwoWeekHigh?.toFixed(2)||"_ _"}</p>
         <p>52W Low: $ {fiftyTwoWeekLow?.toFixed(2)||"_ _"}</p>
         
      </div>
      <div className="highlow">
        <span >High: $ {highPrice?.toFixed(2)||"_ _"} </span>
        <span>Low :  $ {lowPrice?.toFixed(2)||"_ _"}</span>
      </div>
       <div className="range-selector">
        {["1D","5D","1M","1Y","MAX"].map(r=>(
            <button 
            key = {r}
            onClick={()=>setDateRange(r)}
            className={`date-btn ${dateRange ===r?"active":""}`}>
              {r}
            </button>
        ))}
        <button  className={`chart-btn ${chartType==='line'?"active":""}`} onClick={()=>setChartType("line")}>Line</button>
        <button className={`chart-btn ${chartType==='candlestick'?"active":""}`}   onClick={()=>setChartType("candlestick")}>CandleStick</button>
       </div>

      <div className="chart-container">
       {chartType=="line" &&(
        <>
         <Sparklines data = {prices} width = {400} height = {220}>
          <SparklinesLine style={{stroke:isUp ?"#4caf50" :"#f44336",strokeWidth:2}}/>
          <SparklinesLine data ={movingAvg} style={{stroke :"#ff9800",strokeWidth:1}}/>
        </Sparklines>
        <Sparklines data = {volume||[]} width={100} height={80}>
          <SparklinesBars style={{fill:darkMode?"#888":"#ccc"}}/>
        </Sparklines>
        </>
       )}
       {chartType=="candlestick" && (
        <Chart 
        options = {{
          chart:{
            type:"candlestick",
            height:200,
            background:darkMode?"#1e1e1e":"#fff",
          },
          xaxis:{
            type:"datetime",
          },
          yaxis:{
            tooltip:{
              enable:true,
            },
          },
        }}
        series={[
          {
            name:"Price",
            data:candleData,
          },
        ]}
        type = "candlestick"
        height={200}
        />
       )}
      </div>
           {/* footer */}
      <div className="footer">
        <span >Last Updated: {secondAgo} seconds ago</span>
      </div>
    </div>
  );
};

export default LivePrice; 