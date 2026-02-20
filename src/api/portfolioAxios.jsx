import apiClient from "../api/apiClient";

/**
 * Fetch logged-in user's portfolio
 */
export const fetchPortfolio = async () => {
  const res = await apiClient.get("/api/portfolio/user");
  return res.data;
};

/**
 * Fetch portfolio stock by symbol
 */
export const fetchStockBySymbol = async (stocksymbol) => {
  const res = await apiClient.get(
    `/api/portfolio/user/${stocksymbol}`
  );
  return res.data;
};

/**
 * Add portfolio item
 */
export const addPortfolioItem = async (data) => {
  const res = await apiClient.post(
    "/api/portfolio/user/add",
    data
  );
  return res.data;
};

/**
 * Delete portfolio item
 */
export const deletePortfolioItem = async (stocksymbol) => {
  const res = await apiClient.delete(
    `/api/portfolio/user/${stocksymbol}/delete`
  );
  return res.data;
};