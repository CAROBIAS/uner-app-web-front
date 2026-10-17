import { HttpErrorResponse } from '@angular/common/http';

/**
 * Convierte un error del backend en un texto para mostrar al usuario.
 *
 * El backend manda el motivo en "message" (un texto o una lista de textos).
 * Si no hay respuesta del servidor (apagado o caído), devuelve un aviso de conexión.
 */
export function obtenerMensajeDeError(error: HttpErrorResponse): string {
  if (error.status === 0 || error.status >= 500) {
    return 'No se pudo conectar con el servidor. Intentá de nuevo más tarde.';
  }
  const mensaje = error.error?.message;
  if (typeof mensaje === 'string') {
    return mensaje;
  }
  if (Array.isArray(mensaje)) {
    return mensaje.join('. ');
  }
  return 'Ocurrió un error inesperado. Intentá de nuevo.';
}