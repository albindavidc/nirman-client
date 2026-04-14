import { inject, provideAppInitializer } from '@angular/core';
import { Store } from '@ngrx/store';
import * as LoginActions from '../../features/auth/login/store/login.actions';

/**
 * Factory function to hydrate NgRx store from localStorage on app init.
 * This restores the user session if they refresh the page.
 */
export function initializeAuthState() {
  const store = inject(Store);
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      // Immediately hydrate store from localStorage for instant UI
      store.dispatch(LoginActions.hydrateFromStorage({ user }));
      // Then validate session with backend (async)
      store.dispatch(LoginActions.validateSession());
    } catch {
      localStorage.clear();
      store.dispatch(LoginActions.hydrateComplete());
    }
  } else {
    store.dispatch(LoginActions.hydrateComplete());
  }
}

/**
 * Provider to register the auth state initializer with Angular.
 * Uses provideAppInitializer (Angular 19+) instead of deprecated APP_INITIALIZER.
 */
export const authInitializerProvider =
  provideAppInitializer(initializeAuthState);
