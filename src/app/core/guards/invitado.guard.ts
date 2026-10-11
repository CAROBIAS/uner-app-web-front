import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Guard para páginas de invitados (el login).
 *
 * Si el usuario ya tiene sesión, no tiene sentido mostrarle el login:
 * lo redirige a la pantalla de inicio de su rol.
 */
export const invitadoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService
    .verificarSesion()
    .pipe(
      map((usuario) =>
        usuario ? router.createUrlTree([authService.rutaDeInicio(usuario.rol)]) : true,
      ),
    );
};