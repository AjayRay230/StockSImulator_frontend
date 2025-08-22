import axios from "axios";
import StockCard from "./StockCard";
import SimulateStock from "./SimulateStock";
import { useEffect,useState } from "react";
import StockSelector from "./StockSelector";
import StockPrice from "./StockPrice";
const StockDashboard = ()=>{
 const[stocks,setStocks] = useState([]);
 const[selectedSymbol,setSelectedSymbol] = useState("");
const fetchStocks = async()=>{
    try{
        const token = localStorage.getItem("token");
    const response = await axios.post(`https://stocksimulator-backend.onrender.com/api/stock/by-price`,{currentprice:0},{
        headers:{
                        Authorization:`Bearer ${token}`
                    }
    });
    
    setStocks(response.data);
    }
    catch(err)
    {
        console.log("Error fetching Stocks: ",err);
    }
}
useEffect(()=>{
    fetchStocks();
},[]);
return(
    <div className="">
        <div>
        <h2>All Stocks</h2>
        <SimulateStock onSimulate = {fetchStocks}/>
       
       </div>
       {selectedSymbol && (<div>
        <StockPrice symbol={selectedSymbol}/>
       </div>)}
       <div>
        {stocks.map((stock)=>(
           < StockCard key = {stock.symbol} stock = {stock}/>
        ))}
       </div>
    </div>
)
}
export default StockDashboard;