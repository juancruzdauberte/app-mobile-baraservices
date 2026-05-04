import axios from "axios";
import { supabase } from "./supabase.config";
import { env } from "./env";

export const api = axios.create({
  baseURL: `${env.API_URL}/v1`,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers = {
      ...(config.headers ?? {}),
      Authorization: `Bearer ${session.access_token}`,
    } as any;
  }
  return config;
});
