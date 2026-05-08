export type Role = "CLIENTE" | "PROFESIONAL";
export type User = {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: Role;
  avatar?: string;
};

export type Professional = {
  id: string;
  nombre: string;
  usuario_id: string;
  apellido: string;
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

export type ProfesionalStateProfile =
  | "INCOMPLETO"
  | "PENDIENTE_APROBACION"
  | "PENDIENTE_CATEGORIAS"
  | "ACTIVO"
  | "RECHAZADO"
  | "SUSPENDIDO";
