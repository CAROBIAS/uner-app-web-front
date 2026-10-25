import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly urlUsuarios = '/api/usuarios';

  /** Busca un paciente activo por documento para realizar una reserva administrativa. */
  buscarPaciente(documento: string): Observable<Usuario> {
    return this.http.get<Usuario>(
      `${this.urlUsuarios}/pacientes/${encodeURIComponent(documento)}`,
    );
  }
}
