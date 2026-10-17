import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';
import { Medico } from '../../../core/models/medico.model';
import { EstadoReserva, Reserva } from '../../../core/models/reserva.model';
import { MedicosService } from '../../../core/services/medicos.service';
import { ReservasService } from '../../../core/services/reservas.service';
import { obtenerMensajeDeError } from '../../../shared/utils/mensaje-error';

/** Colores de etiqueta que admite p-tag. */
type Severidad = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

/** Texto y color de cada estado de reserva. */
const ESTADOS: Record<EstadoReserva, { etiqueta: string; severidad: Severidad }> = {
  PENDIENTE: { etiqueta: 'Pendiente', severidad: 'info' },
  ATENDIDO: { etiqueta: 'Atendido', severidad: 'success' },
  AUSENTE: { etiqueta: 'Ausente', severidad: 'warn' },
  CANCELADA_PACIENTE: { etiqueta: 'Cancelado por vos', severidad: 'danger' },
  CANCELADA_ADMIN: { etiqueta: 'Cancelado por la clínica', severidad: 'danger' },
};

/** Una fila de la tabla: la reserva con los datos ya preparados para mostrar. */
interface FilaTurno {
  reserva: Reserva;
  profesional: string;
  estado: string;
  severidad: Severidad;
  puedeCancelar: boolean;
}

/**
 * Pantalla "Mis turnos" del paciente.
 *
 * Lista sus turnos con fecha, profesional, estado y valor congelado,
 * y permite cancelar los pendientes hasta el día anterior al turno.
 */
@Component({
  selector: 'app-mis-turnos',
  imports: [
    DatePipe,
    CurrencyPipe,
    RouterLink,
    ButtonModule,
    ConfirmDialogModule,
    MessageModule,
    TableModule,
    TagModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './mis-turnos.html',
  styleUrl: './mis-turnos.css',
})
export class MisTurnos implements OnInit {
  private readonly medicosService = inject(MedicosService);
  private readonly reservasService = inject(ReservasService);
  private readonly confirmacion = inject(ConfirmationService);

  private readonly reservas = signal<Reserva[]>([]);
  private readonly medicos = signal<Medico[]>([]);

  readonly cargando = signal(true);
  readonly mensajeError = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);

  /** Filas de la tabla, armadas a partir de las reservas y los médicos. */
  readonly filas = computed<FilaTurno[]>(() =>
    this.reservas().map((reserva) => ({
      reserva,
      profesional: this.nombreDelMedico(reserva.id_medico),
      estado: ESTADOS[reserva.estado].etiqueta,
      severidad: ESTADOS[reserva.estado].severidad,
      puedeCancelar: this.sePuedeCancelar(reserva),
    })),
  );

  ngOnInit(): void {
    forkJoin({
      medicos: this.medicosService.listar(),
      reservas: this.reservasService.listarMias(),
    }).subscribe({
      next: ({ medicos, reservas }) => {
        this.medicos.set(medicos);
        this.reservas.set(reservas);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.mensajeError.set(obtenerMensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }

  /** Pide confirmación y cancela el turno. */
  confirmarCancelacion(fila: FilaTurno): void {
    this.confirmacion.confirm({
      header: 'Cancelar turno',
      message: `¿Querés cancelar el turno con ${fila.profesional}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Sí, cancelar', severity: 'danger' },
      rejectButtonProps: { label: 'No', severity: 'secondary', outlined: true },
      accept: () => this.cancelar(fila.reserva.id),
    });
  }

  private cancelar(id: number): void {
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
    this.reservasService.cancelar(id).subscribe({
      next: (actualizada) => {
        this.reservas.update((lista) => lista.map((r) => (r.id === id ? actualizada : r)));
        this.mensajeExito.set('El turno fue cancelado.');
      },
      error: (error: HttpErrorResponse) => {
        this.mensajeError.set(obtenerMensajeDeError(error));
      },
    });
  }

  private nombreDelMedico(idMedico: number): string {
    const medico = this.medicos().find((m) => m.id === idMedico);
    return medico ? `${medico.apellidos}, ${medico.nombres}` : `Médico #${idMedico}`;
  }

  /** Regla de la consigna: el paciente cancela solo hasta el día anterior al turno. */
  private sePuedeCancelar(reserva: Reserva): boolean {
    if (reserva.estado !== 'PENDIENTE') {
      return false;
    }
    const turno = new Date(reserva.fecha_hora);
    const inicioDelDiaDelTurno = new Date(turno.getFullYear(), turno.getMonth(), turno.getDate());
    return new Date() < inicioDelDiaDelTurno;
  }
}