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
import { ActionReducer, MetaReducer, provideStore } from '@ngrx/store';
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
import { adminAuthReducer } from './features/admin/store/admin-auth.reducer';
import { AdminAuthEffects } from './features/admin/store/admin-auth.effects';

/**
 * Meta-reducer that resets the ENTIRE NgRx store (including lazy-loaded
 * feature slices like projects, members, settings, vendorManagement)
 * back to their initial state when the user logs out.
 */
export function logoutMetaReducer(
  reducer: ActionReducer<Record<string, unknown>>,
): ActionReducer<Record<string, unknown>> {
  return (state, action) => {
    if (action.type === '[Login] Logout') {
      // Returning undefined causes every registered reducer (root + feature)
      // to receive undefined as state, which makes them return their initialState.
      state = undefined;
    }
    return reducer(state, action);
  };
}

const metaReducers: MetaReducer[] = [logoutMetaReducer];

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
    provideStore(
      {
        signup: signupReducer,
        login: loginReducer,
        adminAuth: adminAuthReducer,
      },
      { metaReducers },
    ),
    provideEffects([SignupEffects, LoginEffects, AdminAuthEffects]),
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
