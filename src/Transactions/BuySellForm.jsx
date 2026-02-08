import { useEffect, useState } from "react";
import axios from "axios";
import StockSelector from "../Components/stock/StockSelector";
import { toast } from "react-toastify";
import { FaExchangeAlt, FaHashtag,FaSortNumericUp,FaSpinner } from "react-icons/fa";
const BuySellForm = ({  onSuccess }) => {
  const [form, setForm] = useState({
    stocksymbol: "",
    quantity: "",
    action: "buy"
  });
   const[loading,setLoading] = useState(false);
   const[error,setError] = useState({});
   const validate = ()=>{
    const errs = {};
    if(!form.stocksymbol) errs.stocksymbol = "Please Enter the stock symbol";
    if(!form.quantity||form.quantity<=0) errs.quantity = "Please Enter the valid qunatity";
    return errs;
   }
  const action = {
     BUY:  "buy",
     SELL:"sell"
    }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if(Object.keys(validationError).length>0)
    {
      setError(validationError);
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const endpoint =
        form.action === "buy"
          ? "/api/transaction/buy"
          : "/api/transaction/sell";

      const payload = { 
        stocksymbol: form.stocksymbol,
        quantity: Number(form.quantity)
      };

      //console.log("Submitting payload:", payload);

      const response = await axios.post(
        `https://stocksimulator-backend.onrender.com${endpoint}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success(response.data);
     
      setForm({ stocksymbol: "", quantity: "", action: "buy" }); // Reset
      if (onSuccess)
        { onSuccess();
          
        }
    } catch (err) {
      console.error("Transaction error:", err);
      toast.warn(err.response?.data || "Transaction Failed");
    }
    finally{
      setLoading(false);
    }
  };

  return (
    
      <form onSubmit={handleSubmit} className="buysell-form">
        <h3 style={{ textAlign: "center", color: "#222" ,marginBottom:"20px" , fontSize:"22px"}}>
          Buy / Sell Stock
        </h3>

        <label > <FaHashtag className="icon" /> Stock Symbol:
        <StockSelector
          selectedSymbol={form.stocksymbol}
          onChange={(symbol) => setForm({ ...form, stocksymbol: symbol })}
        />
          {error.stocksymbol && <div className="error">{error.stocksymbol}</div>}
          </label>
        <label> <FaSortNumericUp className="icon"/>  Quantity:
        <input
          type="number"
          placeholder="Enter quantity"
          value={form.quantity}
          min="0"
          step = "any"
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.value })
          }
          required
        />
        {error.quantity && <div className="error">{error.quantity}</div>}
          </label>
          <label>
        <FaExchangeAlt className="icon" />Action:
        <select
          value={form.action}
          onChange={(e) => setForm({ ...form, action: e.target.value })}
        >
          <option value={action.BUY}>Buy</option>
          <option value={action.SELL}>Sell</option>
       
          
        </select>
        </label>

        <button type="submit" disabled={loading}>
        {loading ? (
          <>
          Processing<FaSpinner className="icons-spin"/>
          </>
        ):(
          `${form.action==="buy"?"BUY":"SELL"}  Stock `
        )}
       
        </button>
      </form>
  
  );
};

export default BuySellForm;
