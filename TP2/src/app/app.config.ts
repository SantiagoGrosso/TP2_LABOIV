import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../enviroments/enviroment';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
    importProvidersFrom(
      FormsModule,
      HttpClientModule,
      ReactiveFormsModule,
    )
  ]
};
