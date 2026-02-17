import { Routes } from '@angular/router';

export const PHASE_APPROVAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/phase-approval-list/phase-approval-list.component').then(
        (m) => m.PhaseApprovalListComponent,
      ),
  },
];
