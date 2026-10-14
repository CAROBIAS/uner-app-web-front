import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { RolUsuario } from '../models/usuario.model';
import { AuthService } from '../services/auth.service';

/**
 * Guard de autorización por rol.
 *
 * Lee los roles permitidos desde la propiedad "data.roles" de la ruta.
 * - Sin sesión: redirige a /login.
 * - Con un rol no permitido: redirige a la pantalla de inicio de su rol.
 *
 * Ejemplo de uso en las rutas:
 * { path: 'paciente', canActivate: [rolGuard], data: { roles: ['PACIENTE'] } }
 */
export const rolGuard: CanActivateFn = (ruta) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const rolesPermitidos = (ruta.data['roles'] ?? []) as RolUsuario[];

  return authService.verificarSesion().pipe(
    map((usuario) => {
      if (!usuario) {
        return router.createUrlTree(['/login']);
      }
      if (rolesPermitidos.includes(usuario.rol)) {
        return true;
      }
      return router.createUrlTree([authService.rutaDeInicio(usuario.rol)]);
    }),
  );
};