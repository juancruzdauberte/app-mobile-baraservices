import { api } from "../config/axios.config";
import { Professional, Role, User } from "../types/types";

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

export async function sendDocumentation(formData: FormData) {
  const { data } = await api.post("/professionals/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    transformRequest: (data, headers) => {
      return data;
    },
  });
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

export async function updatePassword(password: string) {
  const { data } = await api.post("/auth/update-password", { password });
  return data;
}

export async function createProfessionalJobs(
  profesionalId: string,
  jobs: { categoria_id: string; precio_base_por_hora?: number }[],
) {
  const body = {
    profesional_id: profesionalId,
    jobs,
  };
  console.log("Request body:", JSON.stringify(body));
  const { data } = await api.post("/professionals/jobs", body);
  return data;
}

export async function getCategories() {
  const { data } = await api.get("/categorys");
  return data;
}

export async function getProfessionalProfile(): Promise<Professional | null> {
  const { data } = await api.get("/professionals/profile");
  return data;
}
