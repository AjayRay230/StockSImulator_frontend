import { useEffect, useState } from "react";
import { useUser } from "../context/userContext";
import axios from "axios";
import LivePrice from "./stock/LivePrice";
import { FiPlusCircle,FiTrash } from "react-icons/fi";
import {motion} from "framer-motion";
const WatchList = ()=>{
    const{user} = useUser();
    
   // console.log("user is :", userId);
    const[watchlist,setWatchlist] = useState([]);
    const[symbol,setSymbol]  = useState("");
    useEffect(()=>{
        if(!user) return ;
        const fetchList = async()=>{
            try{
                const token = localStorage.getItem("token");
                const response = await axios.get(`https://stocksimulator-backend.onrender.com/api/watchlist/me`,{
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                });
                setWatchlist(response.data);
            }
            catch(err){
                console.error("Failed to load watchlist",err);
            }

        };
        fetchList();

        
    },[user]);
    const handleAdd = async()=>{
        try{
            if(!symbol)
            {
                alert("please enter the stock symbol..");
                return ;
            };
             const token = localStorage.getItem("token");
            const validateSymbol = await axios.get(`https://stocksimulator-backend.onrender.com/api/stock/${symbol}`,{
                headers:{
                   Authorization:`Bearer ${token}`, 
                }
            });
            if(!validateSymbol.data)
            {
                alert(
                    "Sorry for the inconvenience, this stock symbol does not exist.\nPlease enter a valid symbol."
                    );
                return ;
                
            }
            // if already in the watchlist
            const check = watchlist.find(item=>item.stocksymbol === symbol);
            if(check)
            {
                alert("Stock already in the watchlist!!");
                return;
            }
            const payload = {stocksymbol:symbol};
           
            await axios.post(`https://stocksimulator-backend.onrender.com/api/watchlist/add`,payload,{
                headers:{
                        Authorization:`Bearer ${token}`
                    }
            });
            setSymbol("");
            //refresh list
            const res = await axios.get(`https://stocksimulator-backend.onrender.com/api/watchlist/me`
                ,{
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }
            );
            setWatchlist(prev=>[...prev,{stocksymbol:symbol,addTime:new Date().toISOString()}]);
        }
        catch(err)
        {
            console.error("Error while adding to watchlist",err);
        }
    };
    const handleRemove = async(symbolToRemove)=>{
        try{
            const token = localStorage.getItem("token")
            const payload = {stocksymbol:symbolToRemove};
            await axios.post(`https://stocksimulator-backend.onrender.com/api/watchlist/remove`,payload,{
                headers:{
                        Authorization:`Bearer ${token}`
                    }
            });
            setWatchlist(prev =>prev.filter(item=>item.stocksymbol!==symbolToRemove));
        }
        catch(err)
        {
            console.error("Error to Remove: ",err);
        }
    }
    return(
        <div className="watchlist-container">
            <h2>WatchList</h2>
            <div className="watchlist-add">
            <input type="text" placeholder="Enter stock symbol" value = {symbol}
            onChange={(e)=>setSymbol(e.target.value.toUpperCase())}/>
            <button onClick={handleAdd} ><FiPlusCircle style={{marginRight:"6px", width:"40px"}}/> Add</button>
            </div>
            
                    <div className="watchlist-list">
                    {watchlist.map((item,index)=>(
                        <motion.div className="stock-card" key = {index}
                        initial={{opacity:0,y:20}}
                        animate={{opacity:1,y:0}}
                        transition={{duration:0.3 ,delay:index*0.1}}
                        >
                            <div className="stock-card-header">
                                <div className="symbol">{item.stocksymbol}</div>
                               <div className="date">{new Date(item.addTime).toLocaleDateString()}</div>
                                </div>
                               <LivePrice symbol={item.stocksymbol}/>
                               <button className="remove-btn" onClick={()=>handleRemove(item.stocksymbol)}>
                                <FiTrash style={{marginRight:"6px"}}/>
                                Remove</button>
                            </motion.div>

                    ))}
                    </div>
                
           
        </div>
    )
}
export default WatchList;