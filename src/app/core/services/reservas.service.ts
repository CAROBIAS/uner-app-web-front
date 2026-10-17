import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CrearReservaRequest, Reserva } from '../models/reserva.model';

/** Horarios de atención: de 08:00 a 15:00 (el último turno termina a las 16:00). */
const HORARIOS_ATENCION = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

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

  /** Cancela un turno (el paciente puede hacerlo hasta el día anterior). */
  cancelar(id: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.urlReservas}/${id}/cancelar`, {});
  }

  /**
   * Devuelve los horarios que se pueden elegir para un médico en una fecha.
   *
   * Por ahora el backend no tiene un endpoint de disponibilidad, así que se
   * devuelven todos los horarios de atención, sin los que ya pasaron si la
   * fecha es hoy. Si el horario elegido está ocupado, el backend lo rechaza
   * al reservar y la pantalla muestra su mensaje.
   *
   * Cuando exista GET /api/reservas/disponibilidad, solo hay que cambiar el
   * contenido de este método por la llamada HTTP correspondiente.
   */
  obtenerHorarios(_idMedico: number, fecha: Date): Observable<string[]> {
    const ahora = new Date();
    const esHoy = fecha.toDateString() === ahora.toDateString();
    const horarios = esHoy
      ? HORARIOS_ATENCION.filter((h) => Number(h.slice(0, 2)) > ahora.getHours())
      : HORARIOS_ATENCION;
    return of(horarios);
  }
}