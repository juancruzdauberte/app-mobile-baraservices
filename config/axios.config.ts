import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.API_URL,
});

export const setAuthToken = (token: string) => {
  axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export default axiosInstance;
