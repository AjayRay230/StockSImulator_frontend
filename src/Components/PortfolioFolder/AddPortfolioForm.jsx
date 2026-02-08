import { useState } from "react"
import { useUser } from "../../context/userContext";
import { addPortfolioItem} from "../../api/portfolioAxios";
import StockSelector from "../stock/StockSelector";
import { toast } from "react-toastify";
import { FaHashtag, FaSortNumericUp, FaDollarSign, FaSpinner } from "react-icons/fa";

const AddPortfolioForm =({onAdd})=>{
   const{user} = useUser();
   const userId = user?.userId;
   const[loading,setLoading] = useState(false);
  // if(!userId) alert("user is undefined ")
   const[form,setForm] = useState({
    stocksymbol:"",
    quantity: "",
    averagebuyprice:""
   }) ;
   const handleChange = (e) => {
  const { name, value } = e.target;
  setForm({
    ...form,
    [name]: name === "quantity" || name === "averagebuyprice" ? parseFloat(value) : value,
  });
};
const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    toast.info("Please login to add stocks");
    window.location.href = "/login";
    return;
  }

  if (!form.stocksymbol || form.quantity <= 0 || form.averagebuyprice <= 0) {
    toast.warn("Please fill all the fields");
    return;
  }

  try {
    setLoading(true);
    await addPortfolioItem(userId, form);
    onAdd();
    setForm({ stocksymbol: "", quantity: 0, averagebuyprice: 0 });
  } catch (err) {
    toast.error("Failed to add stock");
  } finally {
    setLoading(false);
  }
};

    
   return (
    
    <form onSubmit={handleSubmit} className="portfolio-form">
      <h3 style={{textAlign:"center",color:"#222",fontSize:"22px",marginBottom:"20px"}}>Add Stock to portfolio </h3>
      <label><FaHashtag className="icon"/> Stock Symbol:
        <StockSelector selectedSymbol={form.stocksymbol}
        onChange = {(Symbol)=>setForm({...form,stocksymbol:Symbol})}
        />
        </label>
        <label><FaSortNumericUp className="icon"/> Quantity:
        <input type = "number" name = "quantity" 
        placeholder="Quantity" value={form.quantity|| ""} 
        onChange={handleChange}
        min = "0"
        step ="any"
        />
        </label>
        <label><FaDollarSign className="icon"/> Avg. Buy Price:
        <input type = "number" name ="averagebuyprice" placeholder="Avg Buy Price"
         value={form.averagebuyprice|| ""} 
         onChange={handleChange}
         min = "0"
         step = "any"
         />
         </label>
        <button type="submit" disabled={loading || !userId}>
          {loading ?(
            <>
            <FaSpinner className="icons-spin"/>Processing... 
            </>
          ):(
            "Add"
          )}

        </button>
    </form>
   )
}
export default AddPortfolioForm;