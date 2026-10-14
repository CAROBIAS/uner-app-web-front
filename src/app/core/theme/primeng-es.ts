import { Translation } from 'primeng/api';

/**
 * Textos de los componentes de PrimeNG en español
 * (calendario, mensajes de tablas vacías, botones de diálogos, etc.).
 * Se registra en `app.config.ts` mediante `providePrimeNG`.
 */
export const PRIMENG_ES: Translation = {
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  firstDayOfWeek: 1,
  dateFormat: 'dd/mm/yy',
  today: 'Hoy',
  clear: 'Limpiar',
  weekHeader: 'Sem',
  accept: 'Sí',
  reject: 'No',
  cancel: 'Cancelar',
  apply: 'Aplicar',
  emptyMessage: 'No hay resultados',
  emptyFilterMessage: 'No se encontraron resultados',
  chooseYear: 'Elegir año',
  chooseMonth: 'Elegir mes',
  chooseDate: 'Elegir fecha',
  prevYear: 'Año anterior',
  nextYear: 'Año siguiente',
  prevMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
};