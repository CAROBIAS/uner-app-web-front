import { DatePipe, CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { Medico } from '../../../core/models/medico.model';
import { MedicosService } from '../../../core/services/medicos.service';
import { ReservasService } from '../../../core/services/reservas.service';
import { obtenerMensajeDeError } from '../../../shared/utils/mensaje-error';

/** Máximo de días hacia adelante para reservar (el backend admite hasta hoy + 29). */
const DIAS_MAXIMOS = 29;

/**
 * Pantalla "Reservar turno" del paciente.
 *
 * Flujo: elegir médico → elegir fecha → elegir horario → confirmar.
 * Muestra un resumen con el valor de la consulta, que se congela al reservar.
 */
@Component({
  selector: 'app-reservar-turno',
  imports: [
    FormsModule,
    RouterLink,
    DatePipe,
    CurrencyPipe,
    NgSelectModule,
    ButtonModule,
    DatePickerModule,
    MessageModule,
  ],
  templateUrl: './reservar-turno.html',
  styleUrl: './reservar-turno.css',
})
export class ReservarTurno implements OnInit {
  private readonly medicosService = inject(MedicosService);
  private readonly reservasService = inject(ReservasService);

  /** Lista de médicos para el selector. */
  readonly medicos = signal<Medico[]>([]);

  /** Médico elegido (su id), fecha elegida y horario elegido. */
  readonly idMedico = signal<number | null>(null);
  readonly fecha = signal<Date | null>(null);
  readonly horario = signal<string | null>(null);

  /** Horarios que se pueden elegir para el médico y la fecha actuales. */
  readonly horarios = signal<string[]>([]);

  /** Estados de la pantalla. */
  readonly cargandoMedicos = signal(true);
  readonly reservando = signal(false);
  readonly mensajeError = signal<string | null>(null);
  readonly reservaConfirmada = signal(false);

  /** Límites del calendario: desde hoy hasta hoy + 29 días, sin fines de semana. */
  readonly fechaMinima = this.inicioDelDia(new Date());
  readonly fechaMaxima = this.sumarDias(this.fechaMinima, DIAS_MAXIMOS);
  readonly diasDeshabilitados = [0, 6];

  /** Médicos con el texto que muestra el selector ("Apellido, Nombre"). */
  readonly opcionesMedicos = computed(() =>
    this.medicos().map((m) => ({ ...m, etiqueta: `${m.apellidos}, ${m.nombres}` })),
  );

  /** Médico elegido completo, para mostrar nombre y precio en el resumen. */
  readonly medicoElegido = computed(
    () => this.medicos().find((m) => m.id === this.idMedico()) ?? null,
  );

  /** true cuando está todo elegido y se puede confirmar. */
  readonly puedeReservar = computed(
    () => !!this.medicoElegido() && !!this.fecha() && !!this.horario() && !this.reservando(),
  );

  ngOnInit(): void {
    this.medicosService.listar().subscribe({
      next: (medicos) => {
        this.medicos.set(medicos);
        this.cargandoMedicos.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.mensajeError.set(obtenerMensajeDeError(error));
        this.cargandoMedicos.set(false);
      },
    });
  }

  /** Al cambiar de médico se reinicia la fecha y el horario. */
  elegirMedico(id: number | null): void {
    this.idMedico.set(id);
    this.fecha.set(null);
    this.horario.set(null);
    this.horarios.set([]);
    this.limpiarMensajes();
  }

  /** Al elegir una fecha se cargan los horarios de ese día. */
  elegirFecha(fecha: Date | null): void {
    this.fecha.set(fecha);
    this.horario.set(null);
    this.limpiarMensajes();
    const idMedico = this.idMedico();
    if (!fecha || idMedico === null) {
      this.horarios.set([]);
      return;
    }
    this.reservasService.obtenerHorarios(idMedico, fecha).subscribe((horarios) => {
      this.horarios.set(horarios);
    });
  }

  elegirHorario(horario: string): void {
    this.horario.set(horario);
    this.limpiarMensajes();
  }

  /** Envía la reserva al backend. */
  reservar(): void {
    const medico = this.medicoElegido();
    const fecha = this.fecha();
    const horario = this.horario();
    if (!medico || !fecha || !horario) {
      return;
    }

    this.reservando.set(true);
    this.limpiarMensajes();

    this.reservasService
      .crear({ id_medico: medico.id, fecha_hora: this.armarFechaHora(fecha, horario) })
      .subscribe({
        next: () => {
          this.reservando.set(false);
          this.reservaConfirmada.set(true);
        },
        error: (error: HttpErrorResponse) => {
          this.reservando.set(false);
          this.mensajeError.set(obtenerMensajeDeError(error));
        },
      });
  }

  /** Vuelve a empezar después de una reserva confirmada. */
  nuevaReserva(): void {
    this.reservaConfirmada.set(false);
    this.elegirMedico(null);
  }

  /** Arma la fecha y hora local que espera el backend, por ejemplo "2026-10-20T09:00:00". */
  private armarFechaHora(fecha: Date, horario: string): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}T${horario}:00`;
  }

  private inicioDelDia(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  }

  private sumarDias(fecha: Date, dias: number): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
  }

  private limpiarMensajes(): void {
    this.mensajeError.set(null);
  }
}