export type Role = "CLIENTE" | "PROFESIONAL";
export type User = {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: Role;
  avatar?: string;
};

export type ProfesionalStateProfile =
  | "INCOMPLETO"
  | "PENDIENTE_APROBACION"
  | "ACTIVO"
  | "RECHAZADO"
  | "SUSPENDIDO";
