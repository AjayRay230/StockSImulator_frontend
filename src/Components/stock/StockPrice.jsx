import { useState, useEffect,useMemo } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { toast } from 'react-toastify';
import { FaMoon, FaSpinner,FaSun } from 'react-icons/fa';
import SimulateStock from "./SimulateStock";

const calculateSMA = (data,period)=>{
  return data.map((_,idx,arr)=>{
    if(idx<period-1) return {x:arr[idx].x,y:null};
    const slice = arr.slice(idx-period+1,idx+1);
    const avg = slice.reduce((sum,val)=>
      sum+val.y,0
    )/slice.length;
    return {x:arr[idx].x,y:avg};
  });
};
const calculateEMA = (data,period)=>{
  let ema  = [];
  let multiplier = 2/(period+1);
  let sum = 0;
  data.forEach((point,idx)=>{
    if(idx<period)
    {
      sum+=point.y;
      ema.push({x:point.x,y:null});
      if(idx==period-1)
      {
        const sma = sum/period;
        ema[idx] = {x:point.x,y:sma};
      }
      
    }
    else{
      const prevEma = ema[idx-1];
      const newEma = (point.y-prevEma.y)*multiplier+prevEma.y;
      ema.push({x:point.x,y:newEma});
    }
  });
  return ema;
};

const StockPrice = ({ symbol,  onBack, refreshKey, onSimulate }) => {
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState([]);
  const[darkMode,setDarkMode] = useState(true);
  const[chartType,setChartType] = useState("line");
  const[dateRange,setDateRange] = useState("1D");
  const[volumeSeries,setVolumeSeries] = useState([]);
  const[ohlcData,setOhlcData] = useState([]);
  const [companyName, setCompanyName] = useState("");
 
  useEffect(() => {
    
    const fetchPrice = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `https://stocksimulator-backend.onrender.com/api/stock-price/closing-price?stocksymbol=${symbol}&range=${dateRange}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
const apiData = response.data;

setOhlcData(apiData.data || []);

// Always reset first (important when switching symbols)
setCompanyName("");

// Extract company name safely
const fullName =
  apiData?.meta?.companyname ||
  apiData?.meta?.symbol ||
  symbol;

setCompanyName(fullName);
     
      } catch (error) {
        toast.error("Error while getting the price", error);
        
      } finally {
        setLoading(false);
      }
    };

    if (symbol){ 
      fetchPrice();
      // const interval  = setInterval(fetchPrice,30000);
      // return ()=>clearInterval(interval);

    }
    
  }, [symbol,dateRange,refreshKey]);

const closePriceData = useMemo(() => 
  ohlcData
    .map(item => ({
      x: new Date(item.timestamp),
      y: parseFloat(item.closePrice),
    }))
    .filter(d => !isNaN(d.y)), 
[ohlcData]);

const ma20 = useMemo(() => calculateSMA(closePriceData, 20), [closePriceData]);
const ema20 = useMemo(() => calculateEMA(closePriceData, 20), [closePriceData]);


  useEffect(() => {
  const candleStickData = ohlcData.map((item) => ({
          x: new Date(item.timestamp),
          y: [
            parseFloat(item.openPrice),
            parseFloat(item.highPrice),
            parseFloat(item.lowPrice),
            parseFloat(item.closePrice),
          ],
        }))
        .filter(d=>d.y.length===4 && 
          d.y.every(v=>typeof v==='number' && !isNaN(v))
        );

        const volumes = ohlcData.map((item)=>(
          {
            x:new Date(item.timestamp),
            y:parseFloat(item.volume),
          }
        ));
       
        //set chart series based on selected type 
       let mainSeries = [];

if (chartType === 'candlestick') {
  mainSeries.push({
    name: "Price",
    type: "candlestick",
    data: candleStickData.filter(d =>
      d.y && d.y.length === 4 && d.y.every(v => !isNaN(v))
    )
  });
} else if (chartType === 'bar') {
  mainSeries.push({
    name: "Price",
    type: "bar",
    data: closePriceData.filter(d => !isNaN(d.y))
  });
} else {
  mainSeries.push({
    name: "Price",
    type: chartType,
    data: closePriceData.filter(d => !isNaN(d.y))
  });
}

mainSeries.push(
  { name: "MA 20", type: "line", data: ma20.filter(d => !isNaN(d.y)) },
  { name: "EMA 20", type: "line", data: ema20.filter(d => !isNaN(d.y)) }
);

setSeries(mainSeries);

         setVolumeSeries([{name:"volume",data:volumes}]);

}, [ohlcData, chartType, ma20, ema20, closePriceData]);


const options = useMemo(() => ({
  chart: {
    type: 'candlestick',
    height: 400,
    background: "transparent",
    animations: { enabled: true, easing: "easeinout", speed: 300 },
    toolbar: { show: true },
  },

  grid: { borderColor: darkMode ? "#444" : "#eee" },
  theme: { mode: darkMode ? "dark" : "light" },

  plotOptions: {
    candlestick: {
      colors: {
        upward: '#26a69a',
        downward: '#ef5350',
      },
      wick: { useFiller: true },
    },
    bar: { borderRadius: 4 },
  },

  stroke: {
    width: chartType === 'line' || chartType === 'area' ? 2 : [1, 1, 1],
    curve: "smooth",
  },

  xaxis: {
    type: 'datetime',
    labels: { style: { colors: darkMode ? "#ccc" : "#333" } },
  },

  yaxis: {
    tooltip: { enabled: true },
    labels: { style: { colors: darkMode ? "#ccc" : "#333" } },
  },

  tooltip: {
    shared: true,
    intersect: false,
    theme: darkMode ? "dark" : "light",
  },

  dataLabels: { enabled: false },

  title: {
    text: companyName || symbol,
    align: "center",
    style: {
      fontSize: "18px",
      fontWeight: "600",
      color: darkMode ? "#fff" : "#000",
    }
  }

}), [darkMode, chartType, symbol, companyName]);
   const volumeOptions =useMemo(()=>({
    chart:{type:"bar",height:150,background:"transparent"},
    grid:{borderColor:darkMode?"#444":"#eee"},
    xaxis:{type:"datetime",labels:{show:false}},
    yaxis:{labels:{show:false}},
    plotOptions:{
      bar:{columnWidth:"70%",borderRadius:3},

    }
    ,
    fill:{colors:[darkMode?"#8884d8":"#82ca9d"]},
    tooltip:{theme:darkMode?"dark" :"light"},

   }),[darkMode]);
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


  return loading ? (
    <span >Loading...{" "}<FaSpinner className='icons-spin'/></span>
  ) : (
  
    <div className={`chart-card ${darkMode ?"dark":""}`}>
<div className='chart-header'>
<SimulateStock onSimulate={onSimulate} />


  {onBack && (
    <button onClick={onBack} className="back-btn">
      ← Back
    </button>
  )}

  <button onClick={() => setDarkMode(!darkMode)}>
    {darkMode ? <FaSun /> : <FaMoon />}
  </button>

  <div className="range-selector">

        {["1D","5D","1M","1Y","MAX"].map(r=>(
            <button 
            key = {r}
            onClick={()=>setDateRange(r)}
            className={dateRange ===r?"active":""}>
              {r}
            </button>
        ))}
       </div>
       <select  value= {chartType}
       onChange = {(e)=>setChartType(e.target.value)}
       className = "chart-type-select">
        <option value = "candlestick">CandleStick</option>
        <option value = "line">Line</option>
        <option value = "area">Area</option>
        <option value = "bar">Bar</option>
        </select>

      </div>
      {series.length>0 && series[0].data.length>0?(
        <>
      <Chart options = {options} series = {series} type = {chartType} height = {400}/>
      

      <Chart options = {volumeOptions} series = {volumeSeries} type = "bar" height = {100}/>
      </>
          ):(
            <div>NO data available for the selected range</div>
          )

        }
    </div>
      );
      
      
  
};

export default StockPrice;
