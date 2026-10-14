import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor de autenticación.
 *
 * Se ejecuta en cada pedido HTTP que hace la app:
 * - Si hay token y el pedido va al backend (/api), le agrega el header
 *   "Authorization: Bearer <token>".
 * - Si el backend responde 401 (token vencido o inválido), cierra la sesión
 *   y lleva al login. No lo hace en el propio login, donde un 401 solo
 *   significa que el documento o la clave son incorrectos.
 */
export const authInterceptor: HttpInterceptorFn = (pedido, siguiente) => {
  const authService = inject(AuthService);
  const token = authService.obtenerToken();
  const vaAlBackend = pedido.url.startsWith('/api');

  const pedidoFinal =
    token && vaAlBackend
      ? pedido.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : pedido;

  return siguiente(pedidoFinal).pipe(
    catchError((error: HttpErrorResponse) => {
      const esLogin = pedido.url.endsWith('/auth/login');
      if (error.status === 401 && vaAlBackend && !esLogin) {
        authService.cerrarSesion();
      }
      return throwError(() => error);
    }),
  );
};