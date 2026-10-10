import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';                  

import { routes } from './app.routes';
import { ClinicaPreset } from './core/theme/clinica-preset';      
import { PRIMENG_ES } from './core/theme/primeng-es';             

export const appConfig: ApplicationConfig = {
  providers: [                                                    
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
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