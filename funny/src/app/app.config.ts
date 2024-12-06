import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { BASE_PATH } from './swagger';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { environment } from '../environments/environment';
import { provideAnimations } from '@angular/platform-browser/animations';
import { version, versionDateString } from './shared/version';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    { provide: BASE_PATH, useValue: environment.apiRoot },
    provideAnimations(),
  ]
};

console.log(`Based on Angular18 Template v${{ version }} [${versionDateString}]`);
