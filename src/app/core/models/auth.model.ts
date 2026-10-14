import { Usuario } from './usuario.model';

/**
 * Datos que se envían a POST /api/auth/login.
 * Los nombres de los campos tienen que coincidir con el LoginDto del backend.
 */
export interface LoginRequest {
  /** Número de documento del usuario. */
  documento: string;
  /** Contraseña del usuario. */
  clave: string;
}

/**
 * Respuesta del backend cuando el login es correcto.
 */
export interface LoginResponse {
  /** Token JWT que se envía en cada pedido. Vence a la hora. */
  accessToken: string;
  /** Datos del usuario que inició sesión. */
  usuario: Usuario;
}