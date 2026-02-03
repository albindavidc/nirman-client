import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';
import { signupReducer } from './features/auth/signup/store/signup.reducer';
import { SignupEffects } from './features/auth/signup/store/signup.effects';
import { loginReducer } from './features/auth/login/store/login.reducer';
import { LoginEffects } from './features/auth/login/store/login.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authInitializerProvider } from './core/initializers/auth.initializer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideNativeDateAdapter(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptor]),
    ),
    provideAnimations(),
    provideStore({
      signup: signupReducer,
      login: loginReducer,
    }),
    provideEffects([SignupEffects, LoginEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    authInitializerProvider,
  ],
};
