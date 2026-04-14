import { Routes } from '@angular/router';

export const COMMUNICATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./communication-layout.component').then(
        (m) => m.CommunicationLayoutComponent
      ),
  },
];
