import axios from "axios";
import StockCard from "./StockCard";
import SimulateStock from "./SimulateStock";
import { useEffect,useState } from "react";
import StockSelector from "./StockSelector";
import StockPrice from "./StockPrice";
import { useNavigate } from "react-router-dom";
const StockDashboard = ()=>{
 const[stocks,setStocks] = useState([]);
 const[selectedSymbol,setSelectedSymbol] = useState("");
 const [loading, setLoading] = useState(true);
const navigate = useNavigate();
const [refreshKey, setRefreshKey] = useState(0);

const fetchStocks = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");

    const response = await axios.post(
      "https://stocksimulator-backend.onrender.com/api/stock/by-price",
      { currentprice: 0 },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setStocks(response.data);
  } catch (err) {
  if (err.response?.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }
  console.log("Error fetching Stocks: ", err);
}

finally {
    setLoading(false);
  }
};

useEffect(()=>{
    fetchStocks();
},[]);
return(
    <div className="">
      <div className="dashboard">

  <header>
    <h2>Stock Overview</h2>

    <StockSelector
      selectedSymbol={selectedSymbol}
      onChange={setSelectedSymbol}
    />

   <SimulateStock
  onSimulate={() => {
    fetchStocks();
    setRefreshKey(prev => prev + 1);
  }}
/>

  </header>

{selectedSymbol ? (
  <StockPrice
    symbol={selectedSymbol}
    refreshKey={refreshKey}
    onBack={() => setSelectedSymbol("")}
  />
) : (

    <>
      {loading && <p>Loading stocks...</p>}

      {!loading && stocks.length === 0 && (
        <p>No stocks available</p>
      )}

      {!loading && (
        <main className="stock-grid">
          {stocks.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </main>
      )}
    </>
  )}

</div>



    </div>
)
}
export default StockDashboard;