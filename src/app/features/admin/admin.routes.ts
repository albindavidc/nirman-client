import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./components/dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
  },
  {
    path: 'projects',

    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    loadChildren: () =>
      import('../shared-features/projects/projects.routes').then(
        (m) => m.PROJECTS_ROUTES,
      ),
  },
  {
    path: 'project-workers',
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    loadChildren: () =>
      import('../shared-features/workers/workers.routes').then(
        (m) => m.WORKER_ROUTES,
      ),
  },
  {
    path: 'phase-approvals',
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./components/phase-approval/phase-approval-list.component').then(
        (m) => m.PhaseApprovalListComponent,
      ),
  },
  {
    path: 'material-approvals',
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./components/material-approval/material-approvals.component').then(
        (m) => m.MaterialApprovalsComponent,
      ),
  },
  {
    path: 'finance/invoices',
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/invoices/admin-invoice-list/admin-invoice-list.component').then(
            (m) => m.AdminInvoiceListComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/invoices/admin-invoice-detail/admin-invoice-detail.component').then(
            (m) => m.AdminInvoiceDetailComponent,
          ),
      },
    ],
  },
];
