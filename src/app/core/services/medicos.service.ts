import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Medico } from '../models/medico.model';

/**
 * Servicio de médicos: consulta la lista de médicos al backend.
 */
@Injectable({ providedIn: 'root' })
export class MedicosService {
  private readonly http = inject(HttpClient);

  /** Dirección base de los endpoints de médicos (pasa por el proxy). */
  private readonly urlMedicos = '/api/medicos';

  /** Devuelve la lista de médicos con su valor de consulta actual. */
  listar(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.urlMedicos);
  }
  
  /** Actualiza el honorario de un médico (solo disponible para administración). */
  actualizarValorConsulta(idMedico: number, valor_consulta: number): Observable<Medico> {
    return this.http.patch<Medico>(`${this.urlMedicos}/${idMedico}/valor-consulta`, {
      valor_consulta,
    });
  }
}