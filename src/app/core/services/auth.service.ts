import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { RolUsuario, Usuario } from '../models/usuario.model';

/** Clave con la que se guarda el token en el localStorage del navegador. */
const CLAVE_TOKEN = 'clinica_token';

/** Pantalla de inicio de cada rol, a donde se redirige después del login. */
const INICIO_POR_ROL: Record<RolUsuario, string> = {
  PACIENTE: '/paciente',
  MEDICO: '/doctor',
  ADMINISTRADOR: '/admin',
};

/**
 * Servicio de autenticación.
 *
 * Se encarga de iniciar y cerrar sesión contra el backend,
 * guardar el token y mantener los datos del usuario logueado.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  /** Dirección base de los endpoints de autenticación (pasa por el proxy). */
  private readonly urlAuth = '/api/auth';

  /** Usuario logueado, o null si no hay sesión. */
  private readonly usuario = signal<Usuario | null>(null);

  /** Usuario logueado, de solo lectura para los componentes. */
  readonly usuarioActual = this.usuario.asReadonly();

  /** true si hay un usuario logueado. */
  readonly estaLogueado = computed(() => this.usuario() !== null);

  /**
   * Inicia sesión con documento y clave.
   * Si el backend responde bien, guarda el token y los datos del usuario.
   * Si responde con error (401, 403, 400), el error le llega al componente.
   */
  login(datos: LoginRequest): Observable<Usuario> {
    return this.http.post<LoginResponse>(`${this.urlAuth}/login`, datos).pipe(
      tap((respuesta) => {
        localStorage.setItem(CLAVE_TOKEN, respuesta.accessToken);
        this.usuario.set(respuesta.usuario);
      }),
      map((respuesta) => respuesta.usuario),
    );
  }

  /**
   * Verifica si hay una sesión válida. La usan los guards.
   * - Si el usuario ya está cargado, lo devuelve sin llamar al backend.
   * - Si hay token guardado (por ejemplo, después de un F5), pide el perfil al backend.
   * - Si no hay token o el backend lo rechaza, devuelve null.
   */
  verificarSesion(): Observable<Usuario | null> {
    const usuarioCargado = this.usuario();
    if (usuarioCargado) {
      return of(usuarioCargado);
    }
    if (!this.obtenerToken()) {
      return of(null);
    }
    return this.http.get<Usuario>(`${this.urlAuth}/perfil`).pipe(
      tap((usuario) => this.usuario.set(usuario)),
      catchError(() => {
        this.limpiarSesion();
        return of(null);
      }),
    );
  }

  /** Devuelve el token guardado, o null si no hay. Lo usa el interceptor. */
  obtenerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  /** Devuelve la ruta de inicio que corresponde a un rol. */
  rutaDeInicio(rol: RolUsuario): string {
    return INICIO_POR_ROL[rol];
  }

  /** Cierra la sesión y vuelve a la pantalla de login. */
  cerrarSesion(): void {
    this.limpiarSesion();
    this.router.navigate(['/login']);
  }

  /** Borra el token y los datos del usuario, sin navegar. */
  private limpiarSesion(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    this.usuario.set(null);
  }
}