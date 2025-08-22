import axios from "axios";
const Base_url = "https://stocksimulator-backend.onrender.com/api/user"
const getAuthHeader = ()=>{
   const token = localStorage.getItem("token");
   return{
      header:`Bearer${token}`
   }
}
export const addUser = async(userData)=>{
    const response =await axios.post(`${Base_url}/add`,userData,getAuthHeader());
    return response.data;
}