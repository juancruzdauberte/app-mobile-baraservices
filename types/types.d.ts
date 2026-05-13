export type Role = "CLIENTE" | "PROFESIONAL";

export type Category = {
  descripcion: string;
  nombre: string;
  id: string;
};
export type Categories = Category[];
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
  // Campos opcionales (sólo presentes si es PROFESIONAL, o si el endpoint decide incluirlos)
  biografia?: string | null;
  calificacion_promedio?: string | null;
  total_trabajos_realizados?: number | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
  estado_perfil?: ProfesionalStateProfile;
  fecha_envio_documentos?: string | Date | null;
};
export type ProfesionalStateProfile =
  | "INCOMPLETO"
  | "PENDIENTE_APROBACION"
  | "PENDIENTE_CATEGORIAS"
  | "ACTIVO"
  | "RECHAZADO"
  | "SUSPENDIDO";
