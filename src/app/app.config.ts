import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';                  

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { ClinicaPreset } from './core/theme/clinica-preset';     
import { PRIMENG_ES } from './core/theme/primeng-es';             

export const appConfig: ApplicationConfig = {
  providers: [                                                    
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
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