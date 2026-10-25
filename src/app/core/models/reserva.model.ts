/**
 * Estados posibles de una reserva (enum EstadoReserva del backend).
 */
export type EstadoReserva =
  | 'PENDIENTE'
  | 'ATENDIDO'
  | 'AUSENTE'
  | 'CANCELADA_PACIENTE'
  | 'CANCELADA_ADMIN';

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
  /** Médico del turno. */
  id_medico: number;
  /** Paciente que reservó. */
  id_paciente: number;
  /** Fecha y hora del turno (texto en formato ISO). */
  fecha_hora: string;
  /** Estado actual del turno. */
  estado: EstadoReserva;
  /** Valor de la consulta congelado al momento de reservar, en pesos. */
  valor_congelado: number;
  /** Paciente solicitud de datos. */
  paciente_nombres?: string;
  paciente_apellidos?: string;
  paciente_documento?: string;
  /** Médicos solicitud de datos. */
  medico_nombres?: string;
  medico_apellidos?: string;
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