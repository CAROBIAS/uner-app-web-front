import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Tema visual de CLINICA Grupo AD para PrimeNG.
 *
 * Parte del tema base "Aura" de PrimeNG y reemplaza su color primario
 * por la escala del azul de la clínica (#0866D9 en el tono 500).
 * Así, todos los componentes de PrimeNG (botones, calendario, selects,
 * foco de los inputs, etc.) usan automáticamente los colores de la marca.
 *
 * Los colores de referencia están definidos también como variables CSS
 * en `src/styles.css`.
 */
export const ClinicaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f3f7fd',
      100: '#e1edfa',
      200: '#c1d9f6',
      300: '#97bfef',
      400: '#5797e5',
      500: '#0866d9',
      600: '#085abe',
      700: '#094da4',
      800: '#094189',
      900: '#09356f',
      950: '#092b5a',
    },
  },
});