import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';
import { Medico, /* Paciente */ } from '../../../core/models/medico.model';
import { EstadoReserva, Reserva } from '../../../core/models/reserva.model';
import { MedicosService } from '../../../core/services/medicos.service';
import { ReservasService } from '../../../core/services/reservas.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { obtenerMensajeDeError } from '../../../shared/utils/mensaje-error';
import { Usuario } from '../../../core/models/usuario.model';

type Severidad = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

const ESTADOS: Record<EstadoReserva, { etiqueta: string; severidad: Severidad }> = {
  ACTIVO: { etiqueta: 'Activo', severidad: 'info' },
  ATENDIDO: { etiqueta: 'Atendido', severidad: 'success' },
  AUSENTE: { etiqueta: 'Ausente', severidad: 'warn' },
  CANCELADO: { etiqueta: 'Cancelado', severidad: 'danger' },
};

@Component({
  selector: 'app-inicio-admin',
  imports: [
    CurrencyPipe,
    DatePipe,
    ButtonModule,
    ConfirmDialogModule,
    MessageModule,
    TableModule,
    TagModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './inicio-admin.html',
  styleUrl: './inicio-admin.css',
})
export class InicioAdmin implements OnInit {
  private readonly medicosService = inject(MedicosService);
  private readonly reservasService = inject(ReservasService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly confirmacion = inject(ConfirmationService);

  readonly medicos = signal<Medico[]>([]);
  readonly reservas = signal<Reserva[]>([]);
  readonly pacienteDocumento = signal('');
  readonly pacienteSeleccionado = signal<Usuario | null>(null);
  readonly idMedico = signal('');
  readonly fecha = signal('');
  readonly horario = signal('');
  readonly valoresEditados = signal<Partial<Record<number, string>>>({});
  readonly cargando = signal(true);
  readonly buscandoPaciente = signal(false);
  readonly reservando = signal(false);
  readonly guardandoMedicoId = signal<number | null>(null);
  readonly cancelandoId = signal<number | null>(null);
  readonly mensajeError = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);

  readonly horarios = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
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

  cambiarDocumento(evento: Event): void {
    this.pacienteDocumento.set((evento.target as HTMLInputElement).value);
    this.pacienteSeleccionado.set(null);
    this.buscandoPaciente.set(false);
  }

  buscarPaciente(): void {
    const documento = this.pacienteDocumento().trim();
    if (!documento) {
      this.mensajeError.set('Ingresá el documento del paciente.');
      return;
    }
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
    this.buscandoPaciente.set(true);
    this.usuariosService.buscarPaciente(documento).subscribe({
      next: (paciente) => {
        if (documento === this.pacienteDocumento().trim()) {
          this.pacienteSeleccionado.set(paciente);
          this.buscandoPaciente.set(false);
        }
      },
      error: (error: HttpErrorResponse) => {
        if (documento === this.pacienteDocumento().trim()) {
          this.buscandoPaciente.set(false);
          this.mensajeError.set(obtenerMensajeDeError(error));
        }
      },
    });
  }

  cambiarMedico(evento: Event): void {
    this.idMedico.set((evento.target as HTMLSelectElement).value);
  }

  cambiarFecha(evento: Event): void {
    this.fecha.set((evento.target as HTMLInputElement).value);
  }

  cambiarHorario(evento: Event): void {
    this.horario.set((evento.target as HTMLSelectElement).value);
  }

  cambiarValor(idMedico: number, evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.valoresEditados.update((valores) => ({ ...valores, [idMedico]: valor }));
  }

  guardarValorConsulta(medico: Medico): void {
    const valor = Number(this.valoresEditados()[medico.id] ?? medico.valor_consulta);
    if (!Number.isInteger(valor) || valor < 1) {
      this.mensajeError.set('El honorario debe ser un número entero mayor que cero.');
      return;
    }
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
    this.guardandoMedicoId.set(medico.id);
    this.medicosService.actualizarValorConsulta(medico.id, valor).subscribe({
      next: (actualizado) => {
        this.medicos.update((lista) =>
          lista.map((item) => (item.id === actualizado.id ? actualizado : item)),
        );
        this.valoresEditados.update((valores) => {
          const actualizados = { ...valores };
          delete actualizados[medico.id];
          return actualizados;
        });
        this.guardandoMedicoId.set(null);
        this.mensajeExito.set(`Honorario actualizado para ${medico.apellidos}, ${medico.nombres}.`);
      },
      error: (error: HttpErrorResponse) => {
        this.guardandoMedicoId.set(null);
        this.mensajeError.set(obtenerMensajeDeError(error));
      },
    });
  }

  reservarParaPaciente(): void {
    const paciente = this.pacienteSeleccionado();
    const idMedico = Number(this.idMedico());
    if (!paciente || !idMedico || !this.fecha() || !this.horario()) {
      this.mensajeError.set('Buscá un paciente y completá médico, fecha y horario.');
      return;
    }

    this.mensajeError.set(null);
    this.mensajeExito.set(null);
    this.reservando.set(true);
    this.reservasService
      .crearParaPaciente({
        id_paciente: paciente.id,
        id_medico: idMedico,
        fecha_hora: `${this.fecha()}T${this.horario()}:00`,
      })
      .subscribe({
        next: (reserva) => {
          const medico = this.medicos().find((item) => item.id === idMedico);
          const reservaConNombres: Reserva = {
            ...reserva,
            paciente_nombres: paciente.nombres,
            paciente_apellidos: paciente.apellidos,
            paciente_documento: paciente.documento,
            medico_nombres: medico?.nombres,
            medico_apellidos: medico?.apellidos,
          };
          this.reservas.update((lista) => [reservaConNombres, ...lista]);
          this.reservando.set(false);
          this.mensajeExito.set('El turno fue reservado para el paciente.');
          this.fecha.set('');
          this.horario.set('');
          this.idMedico.set('');
        },
        error: (error: HttpErrorResponse) => {
          this.reservando.set(false);
          this.mensajeError.set(obtenerMensajeDeError(error));
        },
      });
  }

  confirmarCancelacion(reserva: Reserva): void {
    this.confirmacion.confirm({
      header: 'Cancelar turno',
      message: `¿Querés cancelar el turno de ${this.nombrePaciente(reserva)}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Sí, cancelar', severity: 'danger' },
      rejectButtonProps: { label: 'No', severity: 'secondary', outlined: true },
      accept: () => this.cancelar(reserva),
    });
  }

  etiquetaEstado(estado: EstadoReserva): string {
    return ESTADOS[estado]?.etiqueta;
  }

  severidadEstado(estado: EstadoReserva): Severidad {
    return ESTADOS[estado]?.severidad;
  }

  nombreMedico(reserva: Reserva): string {
    if (reserva.medico_apellidos && reserva.medico_nombres) {
      return `${reserva.medico_apellidos}, ${reserva.medico_nombres}`;
    }
    const medico = this.medicos().find((item) => item.id === reserva.id_medico);
    return medico ? `${medico.apellidos}, ${medico.nombres}` : `Médico #${reserva.id_medico}`;
  }

  nombrePaciente(reserva: Reserva): string {
    return reserva.paciente_apellidos && reserva.paciente_nombres
      ? `${reserva.paciente_apellidos}, ${reserva.paciente_nombres}`
      : `Paciente #${reserva.id_paciente}`;
  }

  puedeCancelar(reserva: Reserva): boolean {
    return reserva.estado === 'ACTIVO' && new Date() < new Date(reserva.fecha_hora);
  }

  private cancelar(reserva: Reserva): void {
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
    this.cancelandoId.set(reserva.id);
    this.reservasService.cancelar(reserva.id).subscribe({
      next: (actualizada) => {
        this.reservas.update((lista) =>
          lista.map((item) => (item.id === actualizada.id ? actualizada : item)),
        );
        this.cancelandoId.set(null);
        this.mensajeExito.set('El turno fue cancelado.');
      },
      error: (error: HttpErrorResponse) => {
        this.cancelandoId.set(null);
        this.mensajeError.set(obtenerMensajeDeError(error));
      },
    });
  }
}
