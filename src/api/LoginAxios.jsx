
import axios from "axios";

const LoginAxios = () => {
  const token = localStorage.getItem("token");

  return axios.create({
    baseURL: "https://stocksimulator-backend.onrender.com/api/user",
    headers: {
      Authorization: `Bearer ${token}`  
    }
  });
};

export default LoginAxios;
