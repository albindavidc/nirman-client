import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'signup',
    loadChildren: () =>
      import('./signup/signup.routes').then((m) => m.SIGNUP_ROUTES),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.routes').then((m) => m.LOGIN_ROUTES),
  },
  // Redirect empty path to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
