/**
 * Médico, tal como lo devuelve GET /api/medicos.
 */
export interface Medico {
  /** Identificador del médico (es el que se usa para reservar). */
  id: number;
  /** Identificador del usuario asociado al médico. */
  id_usuario: number;
  /** Nombres del médico. */
  nombres: string;
  /** Apellidos del médico. */
  apellidos: string;
  /** Número de matrícula profesional. */
  matricula: number;
  /** Valor actual de la consulta, en pesos. */
  valor_consulta: number;
}