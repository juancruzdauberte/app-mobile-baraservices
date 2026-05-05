import { api } from "../config/axios.config";
import { Role, User } from "../types/types";

export async function registerUser({
  email,
  password,
  nombre,
  apellido,
  rol,
  telefono,
  dni,
}: {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: Role;
  telefono?: string;
  dni?: string;
}) {
  const { data } = await api.post("/auth/register", {
    email,
    password,
    nombre,
    apellido,
    rol,
    telefono,
    dni,
  });
  return data;
}

export async function loginUser({
  email,
  password,
}: {
  email: String;
  password: string;
}) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function getProfile(token: string): Promise<User> {
  const { data } = await api.get("/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}
