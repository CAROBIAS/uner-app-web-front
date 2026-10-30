import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RolUsuario } from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';

/** Un enlace del menú de navegación. */
interface EnlaceMenu {
  /** Texto que se muestra. */
  etiqueta: string;
  /** Ruta a la que lleva. */
  ruta: string;
}

/** Nombre del área que se muestra al lado del logo, según el rol. */
const TITULO_POR_ROL: Record<RolUsuario, string> = {
  PACIENTE: 'Portal Paciente',
  MEDICO: 'Portal Médico',
  ADMINISTRADOR: 'Administración',
};

/**
 * Enlaces del menú de cada rol.
 * Para sumar una pantalla nueva, se agrega acá su enlace y su ruta en app.routes.ts.
 */
const MENU_POR_ROL: Record<RolUsuario, EnlaceMenu[]> = {
  PACIENTE: [
    { etiqueta: 'Inicio', ruta: '/paciente' },
    { etiqueta: 'Mis turnos', ruta: '/paciente/mis-turnos' },
    { etiqueta: 'Reservar turno', ruta: '/paciente/reservar' },
  ],
  MEDICO: [
    { etiqueta: 'Inicio', ruta: '/doctor' },
  ],
  ADMINISTRADOR: [
    { etiqueta: 'Inicio', ruta: '/admin' },
  ],
};

/**
 * Layout principal de las pantallas privadas.
 *
 * Muestra la barra superior (logo, nombre del área, menú del rol,
 * usuario y cerrar sesión) y, debajo, la pantalla de la ruta actual.
 * Lo comparten los tres roles.
 */
@Component({
  selector: 'app-layout-principal',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './layout-principal.html',
  styleUrl: './layout-principal.css',
})
export class LayoutPrincipal {
  private readonly authService = inject(AuthService);

  /** Usuario logueado (lo carga el guard antes de mostrar el layout). */
  readonly usuario = this.authService.usuarioActual;

  /** Nombre del área según el rol. */
  readonly titulo = computed(() => {
    const usuario = this.usuario();
    return usuario ? TITULO_POR_ROL[usuario.rol] : '';
  });

  /** Enlaces del menú según el rol. */
  readonly menu = computed(() => {
    const usuario = this.usuario();
    return usuario ? MENU_POR_ROL[usuario.rol] : [];
  });

  /** Cierra la sesión y vuelve al login. */
  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }
}