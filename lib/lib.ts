import { api } from "../config/axios.config";
import {
  ApiResponse,
  Categories,
  CreateJobRequestPayload,
  JobRequest,
  LoginResponse,
  Professional,
  ProfessionalJob,
  RegisterResponse,
  Role,
  UserProfile,
} from "../types/types";

type RegisterPayload = {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: Role;
  telefono?: string;
  dni?: string;
};

export async function registerUser(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/auth/register", payload);
  return data;
}

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function getProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>("/auth/profile");
  return data;
}

export async function sendDocumentation(
  formData: FormData,
): Promise<Professional> {
  const { data } = await api.post<ApiResponse<Professional>>(
    "/professionals/documents",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: (data) => data,
    },
  );
  return data.data;
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export async function updatePassword(password: string): Promise<void> {
  await api.post("/auth/update-password", { password });
}

export async function createProfessionalJobs(
  profesionalId: string,
  jobs: { categoria_id: string; precio_base_por_hora?: number }[],
): Promise<ProfessionalJob[]> {
  const { data } = await api.post<ApiResponse<ProfessionalJob[]>>(
    "/professionals/jobs",
    { profesional_id: profesionalId, jobs },
  );
  return data.data;
}

export async function getCategories(): Promise<Categories> {
  const { data } = await api.get<ApiResponse<Categories>>("/categorys");
  return data.data;
}

export async function getProfessionalProfile(): Promise<Professional> {
  const { data } = await api.get<ApiResponse<Professional>>(
    "/professionals/profile",
  );
  return data.data;
}

export async function createJobRequest(
  payload: CreateJobRequestPayload,
): Promise<JobRequest> {
  const { data } = await api.post<ApiResponse<JobRequest>>(
    "/job-requests",
    payload,
  );
  return data.data;
}

export async function getMyJobRequests(params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: JobRequest[]; meta: import("../types/types").ApiMeta }> {
  const { data } = await api.get<
    import("../types/types").ApiPaginatedResponse<JobRequest>
  >("/job-requests", { params });
  return { data: data.data, meta: data.meta };
}
