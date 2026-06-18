// ---------------------------------------------------------------------------
// Roles & Enums
// ---------------------------------------------------------------------------

export type Role = "CLIENTE" | "PROFESIONAL" | "ADMIN";

export type Urgencia = "BAJA" | "MEDIA" | "EMERGENCIA";

export type JobRequestEstado =
  | "ABIERTA"
  | "ASIGNADA"
  | "CANCELADA"
  | "EXPIRADA"
  | "COMPLETA";

export type ProposalEstado =
  | "PENDIENTE"
  | "ACEPTADA"
  | "RECHAZADA"
  | "CANCELADA";

export type WorkOrderEstado =
  | "PROGRAMADA"
  | "EN_PROGRESO"
  | "EN_DISPUTA"
  | "COMPLETADA"
  | "CANCELADA";

export type ProfileEstado =
  | "ACTIVO"
  | "INACTIVO"
  | "PENDIENTE_APROBACION"
  | "RECHAZADO";

export type ComplaintEstado =
  | "PENDIENTE"
  | "EN_REVISION"
  | "RESUELTO"
  | "RECHAZADO";

export type ProfesionalStateProfile =
  | "INCOMPLETO"
  | "PENDIENTE_APROBACION"
  | "PENDIENTE_CATEGORIAS"
  | "ACTIVO"
  | "RECHAZADO"
  | "SUSPENDIDO";

// ---------------------------------------------------------------------------
// API Envelope
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
// Auth
// ---------------------------------------------------------------------------

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: Record<string, unknown>;
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
// User Profile
// ---------------------------------------------------------------------------

export type UserProfile = {
  id: string;
  usuario_id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  dni: string;
  avatar: string | null;
  email: string;
  rol: Role;
  // Solo presentes si el perfil es PROFESIONAL
  biografia?: string | null;
  calificacion_promedio?: number | null;
  total_trabajos_realizados?: number | null;
  latitud?: number | null;
  longitud?: number | null;
  estado_perfil?: ProfesionalStateProfile;
  fecha_envio_documentos?: string | null;
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export type Category = {
  id: string;
  nombre: string;
  descripcion: string;
};

export type Categories = Category[];

// ---------------------------------------------------------------------------
// Job Requests (Solicitudes)
// ---------------------------------------------------------------------------

export type JobRequest = {
  id: string;
  cliente_id: string;
  categoria_id: string;
  titulo: string;
  descripcion: string;
  urgencia: Urgencia | null;
  direccion_formateada: string | null;
  google_place_id: string | null;
  latitud: number;
  longitud: number;
  estado: JobRequestEstado;
  fecha_creacion: string;
  ordenes_trabajo?: { id: string; _count?: { resenas: number } }[];
};

export type CreateJobRequestPayload = {
  titulo: string;
  descripcion: string;
  categoria_id: string;
  latitud: number;
  longitud: number;
  urgencia?: Urgencia;
  direccion_formateada?: string;
  google_place_id?: string;
};

export type JobRequestFilters = {
  estado?: JobRequestEstado;
  categoria_id?: string;
  urgencia?: Urgencia;
  page?: number;
  limit?: number;
};

// ---------------------------------------------------------------------------
// Proposals (Propuestas)
// ---------------------------------------------------------------------------

export type Proposal = {
  id: string;
  profesional_id: string;
  solicitud_trabajo_id: string;
  precio_estimado: number | null;
  mensaje: string | null;
  estado: ProposalEstado;
  fecha_creacion: string;
  // Relación anidada (presente en GET /proposals/my-proposals)
  solicitudes_trabajo?: Pick<
    JobRequest,
    | "id"
    | "titulo"
    | "descripcion"
    | "estado"
    | "urgencia"
    | "categoria_id"
    | "fecha_creacion"
  >;
  // Orden generada al aceptar la propuesta (array por esquema, en práctica máx. 1)
  ordenes_trabajo?: { id: string }[];
  // Datos del profesional (enriquecidos en frontend o anidados por el backend)
  profesionales?: PublicProfessional | null;
};

export type CreateProposalPayload = {
  precio_estimado?: number;
  mensaje?: string;
};

// ---------------------------------------------------------------------------
// Work Orders (Órdenes de Trabajo)
// ---------------------------------------------------------------------------

export type WorkOrder = {
  id: string;
  solicitud_trabajo_id: string;
  propuesta_id: string;
  estado: WorkOrderEstado;
  precio_final: number;
  fecha_creacion: string;
  fecha_programada: string | null;
  _count?: {
    resenas: number;
  };
  // Relaciones anidadas (presente en GET /work-orders/:id)
  solicitudes_trabajo?: {
    id: string;
    titulo: string;
    descripcion: string;
    clientes?: Partial<UserProfile> & { id?: string };
  };
  propuestas?: {
    id: string;
    precio_estimado: number;
    mensaje: string | null;
    profesionales?: Partial<UserProfile> & { id?: string };
  };
};

export type UpdateWorkOrderPricePayload = {
  precio_final: number;
};

// ---------------------------------------------------------------------------
// Reviews (Reseñas)
// ---------------------------------------------------------------------------

export type Review = {
  id: string;
  orden_trabajo_id: string;
  evaluador_id: string;
  evaluado_id: string;
  puntaje: number;
  comentario: string | null;
  fecha_creacion: string;
};

/** Reseña pública — usada en el perfil del profesional (query directa a Supabase) */
export type PublicReview = {
  id: string;
  puntaje: number;
  comentario: string | null;
  fecha_creacion: string;
  evaluador: { nombre: string; apellido: string; avatar: string | null } | null;
};

/** Servicio ofrecido por un profesional — mapeado desde trabajos_profesionales + categorias */
export type ProfessionalService = {
  categoria_id: string;
  nombre: string;
  descripcion: string;
  precio_base_por_hora: number | null;
};

export type CreateReviewPayload = {
  orden_trabajo_id: string;
  puntaje: number;
  comentario?: string;
};

// ---------------------------------------------------------------------------
// Complaints (Denuncias)
// ---------------------------------------------------------------------------

export type Complaint = {
  id: string;
  denunciante_id: string;
  denunciado_id: string;
  tipo_denunciante: Role;
  tipo_denunciado: Role;
  motivo: string;
  descripcion: string | null;
  orden_trabajo_id: string;
  estado: ComplaintEstado;
  fecha_creacion: string;
};

export type CreateComplaintPayload = {
  denunciado_id: string;
  orden_trabajo_id: string;
  motivo: string;
  descripcion?: string;
};

// ---------------------------------------------------------------------------
// Professional
// ---------------------------------------------------------------------------

// Perfil público del cliente (para vistas de profesional)
export type PublicClient = {
  id: string;
  nombre: string;
  apellido: string;
  usuario_id: string;
  telefono: string | null;
  avatar: string | null;
  email: string | null;
};

// Perfil público del profesional (para vistas de cliente)
export type PublicProfessional = {
  id: string;
  nombre: string;
  apellido: string;
  usuario_id: string;
  biografia: string | null;
  calificacion_promedio: number | null;
  total_trabajos_realizados: number | null;
  telefono: string | null;
  avatar: string | null;
  email: string | null;
  estado_perfil: ProfesionalStateProfile;
  // Enriquecidos via Supabase directo en el perfil público
  reviews?: PublicReview[];
  services?: ProfessionalService[];
};

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
  fecha_envio_documentos: string | null;
};

export type ProfessionalJob = {
  id: string;
  profesional_id: string;
  categoria_id: string;
  precio_base_por_hora: number | null;
};

export type UpdateProfessionalPayload = {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  dni?: string;
  biografia?: string;
  avatar?: string;
  categorias?: { categoria_id: string; precio_base_por_hora?: number }[];
};

export type MyProfessionalJob = {
  categoria_id: string;
  nombre: string;
  descripcion: string;
  precio_base_por_hora: number | null;
};

export type CreateProfessionalJobsPayload = {
  jobs: {
    categoria_id: string;
    precio_base_por_hora: number;
  }[];
};
