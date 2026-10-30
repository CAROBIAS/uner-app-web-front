/**
 * Roles posibles de un usuario.
 * Son los mismos valores que devuelve el backend (enum RolUsuario).
 */
export type RolUsuario = 'MEDICO' | 'PACIENTE' | 'ADMINISTRADOR';

export interface UsuarioBase {
  /** Identificador interno del usuario. */
  id: number;
  /** Número de documento, que también se usa para iniciar sesión. */
  documento: string;
  /** Apellidos del usuario. */
  apellidos: string;
  /** Nombres del usuario. */
  nombres: string;
}

/**
 * Datos del usuario logueado, tal como los devuelve el backend
 * en el login (dentro de "usuario") y en GET /api/auth/perfil.
 */
export interface Usuario extends UsuarioBase {
  /** Correo electrónico. */
  email: string;
  /** Rol que define a qué pantallas puede entrar. */
  rol: RolUsuario;
}