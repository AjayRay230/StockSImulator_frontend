import axios from "axios"
import React from "react";
const SimulateStock =({onSimulate})=>{
    const simulate = async()=>{
        const token = localStorage.getItem("token");
        await axios.post(`https://stocksimulator-backend.onrender.com/api/stock/simulate`,{
           headers:{
                        Authorization:`Bearer ${token}`
                    }
        });
        if(onSimulate) onSimulate(); 
    }
    return(
        <button onClick={simulate} className="simulate-btn" >Simulate Stock Price</button>
    )
}
export default SimulateStock;