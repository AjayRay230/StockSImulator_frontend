import axios from "axios";
const Base_url = "https://stocksimulator-backend.onrender.com/api/portfolio/user"
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
 
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const fetchPortfoli = async(userId) => {
  return  axios.get(`${Base_url}/${userId}`, getAuthHeader());
};
export const fetchStockBySymbol = (userId ,stocksymbol) =>{
   return  axios.get(`${Base_url}/${userId}/${stocksymbol}`,getAuthHeader());
}
export const addPortfolioItem = (userId,data)=>{
 return    axios.post(`${Base_url}/${userId}/add`,data,getAuthHeader());
}
export  const deletePortfolioItem = (userId,stocksymbol)=>{
   return  axios.delete(`${Base_url}/${userId}/${stocksymbol}/delete`,getAuthHeader());
}