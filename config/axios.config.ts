import axios from "axios";
import { env } from "./env";

export const api = axios.create({
  baseURL: `${env.API_URL}/v1`,
  timeout: 15000,
});

// Removemos el interceptor async que usa supabase.auth.getSession() 
// porque puede causar deadlocks en React Native durante el login.
// En su lugar, seteamos el token directamente desde el AuthProvider.

export const setGlobalAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
