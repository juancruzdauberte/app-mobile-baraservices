import { api } from "../config/axios.config";
import { supabase } from "../config/supabase.config";
import {
  ApiPaginatedResponse,
  ApiResponse,
  Categories,
  Complaint,
  CreateComplaintPayload,
  CreateJobRequestPayload,
  CreateProposalPayload,
  CreateReviewPayload,
  JobRequest,
  JobRequestFilters,
  LoginResponse,
  MyProfessionalJob,
  Professional,
  ProfessionalJob,
  ProfessionalService,
  Proposal,
  PublicClient,
  PublicProfessional,
  PublicReview,
  RegisterResponse,
  Review,
  Role,
  UpdateProfessionalPayload,
  UpdateWorkOrderPricePayload,
  UserProfile,
  WorkOrder,
} from "../types/types";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

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

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export async function updatePassword(password: string): Promise<void> {
  await api.post("/auth/update-password", { password });
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export type AppNotification = {
  id: string;
  usuario_id: string;
  tipo:
  | "PROPUESTA_RECIBIDA"
  | "PROPUESTA_ACEPTADA"
  | "PROPUESTA_RECHAZADA"
  | "ORDEN_INICIADA"
  | "ORDEN_CANCELADA"
  | "ORDEN_COMPLETADA"
  | "ORDEN_DISPUTADA"
  | "PRECIO_ACTUALIZADO";
  titulo: string;
  mensaje: string;
  payload?: unknown;
  leida: boolean;
  fecha_creacion: string;
};

type RegisterDeviceTokenPayload = {
  token: string;
  plataforma?: string;
  device_id?: string;
};

export async function registerDeviceToken(
  payload: RegisterDeviceTokenPayload,
): Promise<void> {
  await api.post("/notifications/device-token", payload);
}

export async function getMyNotifications(): Promise<AppNotification[]> {
  const { data } =
    await api.get<ApiResponse<AppNotification[]>>("/notifications");
  return data.data;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.patch("/notifications/read-all");
}


// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<Categories> {
  const { data } = await api.get<ApiResponse<Categories>>("/categorys");
  return data.data;
}

// ---------------------------------------------------------------------------
// Professionals
// ---------------------------------------------------------------------------

export async function getProfessionalProfile(): Promise<Professional> {
  const { data } = await api.get<ApiResponse<Professional>>(
    "/professionals/profile",
  );
  return data.data;
}

/** Perfil público de un profesional por su ID (profesionales.id) */
export async function getProfessionalById(
  id: string,
  page = 1,
  limit = 5,
): Promise<PublicProfessional> {
  const { data } = await api.get<ApiResponse<PublicProfessional>>(
    `/professionals/public/${id}`,
    { params: { page, limit } },
  );
  return data.data;
}


/** Perfil público de un cliente por su ID */
export async function getClientById(id: string): Promise<PublicClient> {
  const { data } = await api.get<ApiResponse<PublicClient>>(`/customers/${id}`);
  return data.data;
}

export async function getMyProfessionalJobs(): Promise<MyProfessionalJob[]> {
  const { data } = await api.get<ApiResponse<MyProfessionalJob[]>>(
    "/professionals/me/jobs",
  );
  return data.data;
}

export async function updateMyProfessionalProfile(
  payload: UpdateProfessionalPayload,
): Promise<Professional> {
  const { data } = await api.patch<ApiResponse<Professional>>(
    "/professionals/me",
    payload,
  );
  return data.data;
}

export async function updateProfessional(
  id: string,
  payload: UpdateProfessionalPayload,
): Promise<Professional> {
  const { data } = await api.patch<ApiResponse<Professional>>(
    `/professionals/${id}`,
    payload,
  );
  return data.data;
}

export async function sendDocumentation(
  formData: FormData,
): Promise<Professional> {
  const { data } = await api.post<ApiResponse<Professional>>(
    "/professionals/documents",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: (d) => d,
    },
  );
  return data.data;
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

export async function updateUserProfile(payload: {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  avatar?: string;
  email?: string;
}): Promise<UserProfile> {
  const { data } = await api.patch<ApiResponse<UserProfile>>(
    "/users/profile",
    payload,
  );
  return data.data;
}

export async function uploadUserAvatar(
  uri: string,
  mimeType: string,
): Promise<string> {
  const formData = new FormData();
  const filename = uri.split("/").pop() ?? "avatar.jpg";
  formData.append("avatar", { uri, name: filename, type: mimeType } as any);
  const { data } = await api.post<ApiResponse<{ url: string }>>(
    "/users/avatar",
    formData,
    { headers: { "Content-Type": "multipart/form-data" }, transformRequest: (d) => d },
  );
  return data.data.url;
}

// ---------------------------------------------------------------------------
// Job Requests (Solicitudes)
// ---------------------------------------------------------------------------

export async function createJobRequest(
  payload: CreateJobRequestPayload,
): Promise<JobRequest> {
  const { data } = await api.post<ApiResponse<JobRequest>>(
    "/jobs-requests",
    payload,
  );
  return data.data;
}

export async function getMyJobRequests(
  filters?: JobRequestFilters,
): Promise<{ data: JobRequest[]; meta: import("../types/types").ApiMeta }> {
  const { data } = await api.get<ApiPaginatedResponse<JobRequest>>(
    "/jobs-requests",
    { params: filters },
  );
  return { data: data.data, meta: data.meta };
}

export async function getJobRequestById(id: string): Promise<JobRequest> {
  const { data } = await api.get<ApiResponse<JobRequest>>(
    `/jobs-requests/${id}`,
  );
  return data.data;
}

export async function cancelJobRequest(id: string): Promise<JobRequest> {
  const { data } = await api.patch<ApiResponse<JobRequest>>(
    `/jobs-requests/${id}/cancel`,
  );
  return data.data;
}

export async function deleteJobRequest(id: string): Promise<JobRequest> {
  const { data } = await api.delete<ApiResponse<JobRequest>>(
    `/jobs-requests/${id}`,
  );
  return data.data;
}

// ---------------------------------------------------------------------------
// Proposals (Propuestas)
// ---------------------------------------------------------------------------

/** CLIENTE — propuestas recibidas para una solicitud */
export async function getProposalsByJobRequest(
  reqId: string,
): Promise<Proposal[]> {
  const { data } = await api.get<ApiResponse<Proposal[]>>(
    `/proposals/jobs-requests/${reqId}`,
  );
  return data.data;
}

/** CLIENTE — aceptar propuesta (crea WorkOrder automáticamente) */
export async function acceptProposal(id: string): Promise<WorkOrder> {
  const { data } = await api.patch<ApiResponse<WorkOrder>>(
    `/proposals/${id}/accept`,
  );
  return data.data;
}

/** CLIENTE — rechazar propuesta */
export async function rejectProposal(id: string): Promise<Proposal> {
  const { data } = await api.patch<ApiResponse<Proposal>>(
    `/proposals/${id}/reject`,
  );
  return data.data;
}

/** PROFESIONAL — enviar propuesta para una solicitud */
export async function createProposal(
  reqId: string,
  payload: CreateProposalPayload,
): Promise<Proposal> {
  const { data } = await api.post<ApiResponse<Proposal>>(
    `/proposals/jobs-requests/${reqId}`,
    payload,
  );
  return data.data;
}

/** PROFESIONAL — mis propuestas enviadas */
export async function getMyProposals(): Promise<Proposal[]> {
  const { data } = await api.get<ApiResponse<Proposal[]>>(
    "/proposals/my-proposals",
  );
  return data.data;
}

/** PROFESIONAL — retirar propuesta (solo PENDIENTE) */
export async function deleteProposal(id: string): Promise<void> {
  await api.delete(`/proposals/${id}`);
}

// ---------------------------------------------------------------------------
// Work Orders (Órdenes de Trabajo)
// ---------------------------------------------------------------------------

export async function getMyWorkOrders(): Promise<WorkOrder[]> {
  const { data } = await api.get("/work-orders");
  // Manejar respuesta simple, paginada, o doble-anidada
  const result = data?.data;
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  return [];
}

export async function getWorkOrderById(id: string): Promise<WorkOrder> {
  const { data } = await api.get<ApiResponse<WorkOrder>>(`/work-orders/${id}`);
  return data.data;
}

/** CLIENTE — disputar una orden EN_PROGRESO */
export async function disputeWorkOrder(id: string): Promise<WorkOrder> {
  const { data } = await api.patch<ApiResponse<WorkOrder>>(
    `/work-orders/${id}/dispute`,
  );
  return data.data;
}

/** CLIENTE — confirmar inicio de una orden PROGRAMADA */
export async function confirmStartWorkOrder(id: string): Promise<WorkOrder> {
  const { data } = await api.patch<ApiResponse<WorkOrder>>(
    `/work-orders/${id}/confirm-start`,
  );
  return data.data;
}

/** CLIENTE — cancelar una orden PROGRAMADA */
export async function cancelWorkOrder(id: string): Promise<WorkOrder> {
  const { data } = await api.patch<ApiResponse<WorkOrder>>(
    `/work-orders/${id}/cancel`,
  );
  return data.data;
}

/** PROFESIONAL — completar una orden EN_PROGRESO */
export async function completeWorkOrder(id: string): Promise<WorkOrder> {
  const { data } = await api.patch<ApiResponse<WorkOrder>>(
    `/work-orders/${id}/complete`,
  );
  return data.data;
}

/** PROFESIONAL — actualizar precio de una orden PROGRAMADA */
export async function updateWorkOrderPrice(
  id: string,
  payload: UpdateWorkOrderPricePayload,
): Promise<WorkOrder> {
  const { data } = await api.patch<ApiResponse<WorkOrder>>(
    `/work-orders/${id}/price`,
    payload,
  );
  return data.data;
}

// ---------------------------------------------------------------------------
// Reviews (Reseñas)
// ---------------------------------------------------------------------------

/** CLIENTE — crear reseña post-COMPLETADA */
export async function createReview(
  payload: CreateReviewPayload,
): Promise<Review> {
  const { data } = await api.post<ApiResponse<Review>>("/reviews", payload);
  return data.data;
}

/** PROFESIONAL — mis reseñas recibidas */
export async function getMyReviews(params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: Review[]; meta: import("../types/types").ApiMeta }> {
  const { data } = await api.get<ApiPaginatedResponse<Review>>(
    "/reviews/my-reviews",
    { params },
  );
  return { data: data.data, meta: data.meta };
}

/** PÚBLICO — reseñas recibidas por un profesional (query directa a Supabase) */
export async function getReviewsForProfessional(
  profesionalId: string,
  limit = 5,
): Promise<PublicReview[]> {
  try {
    type RawReviewRow = {
      id: string;
      puntaje: number;
      comentario: string | null;
      fecha_creacion: string;
      evaluador: { nombre: string; apellido: string; avatar: string | null } | null;
    };

    const { data, error } = await supabase
      .from("resenas")
      .select(
        "id, puntaje, comentario, fecha_creacion, evaluador:usuarios!evaluador_id(nombre, apellido, avatar)",
      )
      .eq("evaluado_id", profesionalId)
      .order("fecha_creacion", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return (data as unknown as RawReviewRow[]).map((row) => ({
      id: row.id,
      puntaje: row.puntaje,
      comentario: row.comentario,
      fecha_creacion: row.fecha_creacion,
      evaluador: row.evaluador,
    }));
  } catch {
    return [];
  }
}

/** PÚBLICO — servicios ofrecidos por un profesional (query directa a Supabase) */
export async function getServicesForProfessional(
  profesionalId: string,
): Promise<ProfessionalService[]> {
  try {
    type RawJobRow = {
      categoria_id: string;
      precio_base_por_hora: number | null;
      categorias: { nombre: string; descripcion: string } | null;
    };

    const { data, error } = await supabase
      .from("trabajos_profesionales")
      .select("categoria_id, precio_base_por_hora, categorias(nombre, descripcion)")
      .eq("profesional_id", profesionalId);

    if (error || !data) return [];
    return (data as unknown as RawJobRow[])
      .filter((row) => row.categorias != null)
      .map((row) => ({
        categoria_id: row.categoria_id,
        nombre: row.categorias!.nombre,
        descripcion: row.categorias!.descripcion,
        precio_base_por_hora: row.precio_base_por_hora,
      }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Complaints (Denuncias)
// ---------------------------------------------------------------------------

export async function createComplaint(
  payload: CreateComplaintPayload,
): Promise<Complaint> {
  const { data } = await api.post<ApiResponse<Complaint>>(
    "/complaints",
    payload,
  );
  return data.data;
}
