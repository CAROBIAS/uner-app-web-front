import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { ClinicaPreset } from './core/theme/clinica-preset';
import { PRIMENG_ES } from './core/theme/primeng-es';

/** Formato argentino para fechas y montos (DatePipe y CurrencyPipe). */
registerLocaleData(localeEsAr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-AR' },
    providePrimeNG({
      theme: {
        preset: ClinicaPreset,
        options: {
          darkModeSelector: false,
        },
      },
      translation: PRIMENG_ES,
    }),
  ],
};