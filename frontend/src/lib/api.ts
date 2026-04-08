import axios from "axios";
import { useAuthStore } from "../store/auth";


const BASE = import.meta.env.VITE_API_URL ?? "/api/v1";


export const api = axios.create({ baseURL: BASE });


// Injeta token JWT em toda requisição
api.interceptors.request.use(cfg => {
  const token = useAuthStore.getState().token;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});


// Redireciona para login se 401
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

