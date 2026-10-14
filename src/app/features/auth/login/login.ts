import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Pantalla de inicio de sesión.
 *
 * Pide documento y contraseña, los envía al backend mediante AuthService
 * y, si son correctos, redirige a la pantalla de inicio del rol del usuario.
 */
@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** Formulario con los dos campos obligatorios. */
  readonly formulario = this.fb.group({
    documento: ['', Validators.required],
    clave: ['', Validators.required],
  });

  /** true mientras se espera la respuesta del backend. */
  readonly cargando = signal(false);

  /** Mensaje de error para mostrar debajo del formulario, o null si no hay. */
  readonly mensajeError = signal<string | null>(null);

  /** Se ejecuta al enviar el formulario. */
  ingresar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set(null);

    this.authService.login(this.formulario.getRawValue()).subscribe({
      next: (usuario) => {
        this.router.navigateByUrl(this.authService.rutaDeInicio(usuario.rol));
      },
      error: (error: HttpErrorResponse) => {
        this.mensajeError.set(this.obtenerMensaje(error));
        this.cargando.set(false);
      },
    });
  }

  /**
   * Convierte el error del backend en un texto para el usuario.
   * El backend manda el motivo en "message" (texto o lista de textos).
   */
  private obtenerMensaje(error: HttpErrorResponse): string {
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
}