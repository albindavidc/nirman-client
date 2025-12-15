import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'signup',
    loadChildren: () =>
      import('./signup/signup.routes').then((m) => m.SIGNUP_ROUTES),
  },
  // Future routes: login, forgot-password, etc.
];
