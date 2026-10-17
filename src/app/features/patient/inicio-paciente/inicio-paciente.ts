import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Pantalla de inicio del paciente: saludo y accesos a sus dos acciones principales.
 */
@Component({
  selector: 'app-inicio-paciente',
  imports: [RouterLink],
  templateUrl: './inicio-paciente.html',
  styleUrl: './inicio-paciente.css',
})
export class InicioPaciente {
  /** Usuario logueado, para el saludo. */
  readonly usuario = inject(AuthService).usuarioActual;
}