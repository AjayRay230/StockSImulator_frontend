import apiClient from "../api/apiClient";

export const addUser = async (userData) => {
  const response = await apiClient.post("/api/user/add", userData);
  return response.data;
};