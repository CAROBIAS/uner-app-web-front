import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { invitadoGuard } from './core/guards/invitado.guard';
import { rolGuard } from './core/guards/rol.guard';

/**
 * Rutas de la aplicación.
 *
 * - /login es pública (solo para quien no inició sesión).
 * - Las rutas privadas se muestran dentro del layout principal y requieren sesión.
 * - Cada área (paciente, doctor, admin) solo admite su rol.
 * - Todas las pantallas se cargan con lazy loading.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/layout-principal/layout-principal').then((m) => m.LayoutPrincipal),
    children: [
        {
        path: 'paciente',
        canActivate: [rolGuard],
        data: { roles: ['PACIENTE'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/patient/inicio-paciente/inicio-paciente').then(
                (m) => m.InicioPaciente,
              ),
          },
          {
            path: 'reservar',
            loadComponent: () =>
              import('./features/patient/reservar-turno/reservar-turno').then(
                (m) => m.ReservarTurno,
              ),
          },
          {
            path: 'mis-turnos',
            loadComponent: () =>
              import('./features/patient/mis-turnos/mis-turnos').then((m) => m.MisTurnos),
          },
        ],
      },
      {
        path: 'doctor',
        canActivate: [rolGuard],
        data: { roles: ['MEDICO'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/doctor/inicio-doctor/inicio-doctor').then((m) => m.InicioDoctor),
          },
        ],
      },
      {
        path: 'admin',
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/admin/inicio-admin/inicio-admin').then((m) => m.InicioAdmin),
          },
        ],
      },
    ],
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./shared/components/no-encontrada/no-encontrada').then((m) => m.NoEncontrada),
  },
  { path: '**', redirectTo: 'not-found' },
];