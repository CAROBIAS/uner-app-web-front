import { UsuarioBase } from "./usuario.model";

/**
 * Estados posibles de una reserva (enum EstadoReserva del backend).
 */
export type EstadoReserva =
  | 'ACTIVO'
  | 'ATENDIDO'
  | 'AUSENTE'
  | 'CANCELADO';

/**
 * Estados posibles de una Atencion (enum EstadoAtencion del backend).
 */
  export type EstadoAtencion = 'ATENDIDO' | 'AUSENTE';

/**
 * Reserva de un turno, tal como la devuelve el backend
 * en POST /api/reservas, GET /api/reservas y PATCH /api/reservas/:id/cancelar.
 */
export interface Reserva {
  /** Identificador de la reserva. */
  id: number;
  /** Estado actual del turno. */
  estado: EstadoReserva;

  /** Fecha y hora del turno (texto en formato ISO). */
  fecha_hora: string;
  
  /** Valor de la consulta congelado al momento de reservar, en pesos. */
  valor_consulta: number;

    /** Paciente que reservó. */
  paciente: UsuarioBase;

  /** Médico del turno. */
  medico: UsuarioBase;
}

/**
 * Datos que se envían a POST /api/reservas para reservar un turno.
 */
export interface CrearReservaRequest {
  /** Médico elegido. */
  id_medico: number;
  /** Fecha y hora local del turno, por ejemplo "2026-10-20T09:00:00". */
  fecha_hora: string;
}

export interface CrearReservaAdminRequest extends CrearReservaRequest {
  /** Paciente en reserva. */
  id_paciente: number;
}