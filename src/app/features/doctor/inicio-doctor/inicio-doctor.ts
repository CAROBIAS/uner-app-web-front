import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { EstadoAtencion, EstadoReserva, Reserva } from '../../../core/models/reserva.model';
import { ReservasService } from '../../../core/services/reservas.service';
import { obtenerMensajeDeError } from '../../../shared/utils/mensaje-error';

type Severidad = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

const ESTADOS: Record<EstadoReserva, { etiqueta: string; severidad: Severidad }> = {
  PENDIENTE: { etiqueta: 'Pendiente', severidad: 'info' },
  ATENDIDO: { etiqueta: 'Atendido', severidad: 'success' },
  AUSENTE: { etiqueta: 'Ausente', severidad: 'warn' },
  CANCELADA_PACIENTE: { etiqueta: 'Cancelado por paciente', severidad: 'danger' },
  CANCELADA_ADMIN: { etiqueta: 'Cancelado por clínica', severidad: 'danger' },
};

@Component({
  selector: 'app-inicio-doctor',
  imports: [DatePipe, ButtonModule, MessageModule, TableModule, TagModule],
  templateUrl: './inicio-doctor.html',
  styleUrl: './inicio-doctor.css',
})
export class InicioDoctor implements OnInit {
  private readonly reservasService = inject(ReservasService);

  readonly fechaSeleccionada = signal(this.fechaLocal(new Date()));
  readonly reservas = signal<Reserva[]>([]);
  readonly cargando = signal(true);
  readonly actualizandoId = signal<number | null>(null);
  readonly mensajeError = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarAgenda();
  }

  cambiarFecha(evento: Event): void {
    const fecha = (evento.target as HTMLInputElement).value;
    if (!fecha) {
      return;
    }
    this.fechaSeleccionada.set(fecha);
    this.cargarAgenda();
  }

  cargarAgenda(): void {
    const fechaSolicitada = this.fechaSeleccionada();
    this.cargando.set(true);
    this.mensajeError.set(null);
    this.reservasService.listarAgenda(fechaSolicitada).subscribe({
      next: (reservas) => {
        if (fechaSolicitada === this.fechaSeleccionada()) {
          this.reservas.set(reservas);
          this.cargando.set(false);
        }
      },
      error: (error: HttpErrorResponse) => {
        if (fechaSolicitada === this.fechaSeleccionada()) {
          this.mensajeError.set(obtenerMensajeDeError(error));
          this.cargando.set(false);
        }
      },
    });
  }

  cambiarEstado(reserva: Reserva, estado: EstadoAtencion): void {
    this.actualizandoId.set(reserva.id);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
    this.reservasService.actualizarEstado(reserva.id, estado).subscribe({
      next: (actualizada) => {
        this.reservas.update((lista) =>
          lista.map((item) => (item.id === actualizada.id ? actualizada : item)),
        );
        this.actualizandoId.set(null);
        this.mensajeExito.set(
          estado === 'ATENDIDO' ? 'El turno quedó marcado como atendido.' : 'El turno quedó marcado como ausente.',
        );
      },
      error: (error: HttpErrorResponse) => {
        this.actualizandoId.set(null);
        this.mensajeError.set(obtenerMensajeDeError(error));
      },
    });
  }

  etiquetaEstado(estado: EstadoReserva): string {
    return ESTADOS[estado].etiqueta;
  }

  severidadEstado(estado: EstadoReserva): Severidad {
    return ESTADOS[estado].severidad;
  }

  private fechaLocal(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
