import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrearReservaAdminRequest, CrearReservaRequest, EstadoAtencion, Reserva } from '../models/reserva.model';

/**
 * Servicio de reservas: reservar, listar y cancelar turnos.
 */
@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly http = inject(HttpClient);

  /** Dirección base de los endpoints de reservas (pasa por el proxy). */
  private readonly urlReservas = '/api/reservas';

  /** Devuelve los turnos del paciente logueado (el backend filtra por el token). */
  listarMias(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.urlReservas);
  }

  /** Reserva un turno. El backend congela el valor de la consulta en ese momento. */
  crear(datos: CrearReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(this.urlReservas, datos);
  }

  /** Devuelve la agenda diaria del medico autenticado. */
  listarAgenda(fecha: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.urlReservas}/agenda`, { params: { fecha } });
  }

  /** Cancela un turno (el paciente puede hacerlo hasta el día anterior). */
  cancelar(id: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.urlReservas}/${id}/cancelar`, {});
  }
  
  /** Reserva un turno para un paciente en nombre de la administracion. */
  crearParaPaciente(datos: CrearReservaAdminRequest): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.urlReservas}`, datos);
  }

  /** Registra el resultado de la atención de un turno en la agenda del medico. */
  actualizarEstado(id: number, estado: EstadoAtencion): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.urlReservas}/${id}/estado`, { estado });
  }

  /**
   * Devuelve los horarios libres de un médico en una fecha
   * (GET /api/reservas/disponibilidad), por ejemplo ["08:00", "10:00"].
   * El backend ya saca los ocupados, los fines de semana y, si es hoy, las horas que pasaron.
   */
  obtenerHorarios(idMedico: number, fecha: Date): Observable<string[]> {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return this.http.get<string[]>(`${this.urlReservas}/disponibilidad`, {
      params: { id_medico: idMedico, fecha: `${anio}-${mes}-${dia}` },
    });
  }
}