export type Role = "CLIENTE" | "PROFESIONAL";

export type Urgencia = "BAJA" | "MEDIA" | "ALTA";

// ---------------------------------------------------------------------------
// Envelope
// ---------------------------------------------------------------------------

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ApiMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiPaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  meta: ApiMeta;
};

export type ApiError = {
  statusCode: number;
  message: string;
  error: string;
};

// ---------------------------------------------------------------------------
// Auth (no envelope)
// ---------------------------------------------------------------------------

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: Record<string, unknown>; // Supabase User
};

export type RegisterResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    rol: Role;
    avatar: string | null;
  };
};

// ---------------------------------------------------------------------------
// Domain
// ---------------------------------------------------------------------------

export type CreateJobRequestPayload = {
  urgencia: Urgencia;
  titulo: string;
  descripcion: string;
  categoria_id: string;
  latitud: number;
  longitud: number;
  direccion_formateada: string;
  google_place_id: string;
};

export type JobRequest = {
  id: string;
  urgencia: Urgencia;
  titulo: string;
  descripcion: string;
  categoria_id: string;
  latitud: number;
  longitud: number;
  direccion_formateada: string;
  google_place_id: string;
  cliente_id: string;
  estado: string;
  created_at: string;
};

export type Category = {
  id: string;
  nombre: string;
  descripcion: string;
};

export type Categories = Category[];

export type ProfesionalStateProfile =
  | "INCOMPLETO"
  | "PENDIENTE_APROBACION"
  | "PENDIENTE_CATEGORIAS"
  | "ACTIVO"
  | "RECHAZADO"
  | "SUSPENDIDO";

export type Professional = {
  id: string;
  nombre: string;
  apellido: string;
  usuario_id: string;
  biografia: string | null;
  calificacion_promedio: number | null;
  total_trabajos_realizados: number | null;
  latitud: number | null;
  longitud: number | null;
  dni: string | null;
  telefono: string | null;
  estado_perfil: ProfesionalStateProfile;
  fecha_envio_documentos: string | Date | null;
};

export type ProfessionalJob = {
  id: string;
  profesional_id: string;
  categoria_id: string;
  precio_base_por_hora: number | null;
};

export type UserProfile = {
  id: string;
  usuario_id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  avatar: string | null;
  email: string;
  rol: Role;
  // Solo presentes si el perfil es PROFESIONAL
  biografia?: string | null;
  calificacion_promedio?: string | null;
  total_trabajos_realizados?: number | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
  estado_perfil?: ProfesionalStateProfile;
  fecha_envio_documentos?: string | Date | null;
};
