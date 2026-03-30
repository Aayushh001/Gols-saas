
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API = axios.create({ baseURL });

export const setToken = (token: string) => {
  API.defaults.headers.common["Authorization"] = token;
};
