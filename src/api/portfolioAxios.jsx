import axios from "axios";

const Base_url = "https://stocksimulator-backend.onrender.com/api/portfolio/user";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

/**
 * Fetch logged-in user's portfolio
 * (user resolved from JWT on backend)
 */
export const fetchPortfoli = async () => {
  return axios.get(`${Base_url}`, getAuthHeader());
};

/**
 * Fetch portfolio stock by symbol
 */
export const fetchStockBySymbol = (stocksymbol) => {
  return axios.get(
    `${Base_url}/${stocksymbol}`,
    getAuthHeader()
  );
};

/**
 * Add portfolio item
 */
export const addPortfolioItem = (data) => {
  return axios.post(
    `${Base_url}/add`,
    data,
    getAuthHeader()
  );
};

/**
 * Delete portfolio item
 */
export const deletePortfolioItem = (stocksymbol) => {
  return axios.delete(
    `${Base_url}/${stocksymbol}/delete`,
    getAuthHeader()
  );
};
