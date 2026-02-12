import { Routes } from '@angular/router';
import { HomeComponent } from './shared/components/home/home.component';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [GuestGuard] },
  {
    path: 'auth',
    canActivate: [GuestGuard],
    loadChildren: () =>
      import('./components/layouts/auth/auth.routes').then(
        (m) => m.AUTH_ROUTES,
      ),
  },
  {
    path: 'auth/pending-approval',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./components/layouts/auth/pages/pending-approval/pending-approval.component').then(
        (m) => m.PendingApprovalComponent,
      ),
  },
  {
    path: 'auth/application-rejected',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./components/layouts/auth/pages/application-rejected/application-rejected.component').then(
        (m) => m.ApplicationRejectedComponent,
      ),
  },
  {
    path: '',
    canActivate: [AuthGuard],

    loadComponent: () =>
      import('./core/components/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    children: [
      {
        path: 'vendor-management',
        loadChildren: () =>
          import('./components/vendor/vendor-management.routes').then(
            (m) => m.VENDOR_MANAGEMENT_ROUTES,
          ),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./shared/components/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./components/layouts/settings/settings.routes').then(
            (m) => m.SETTINGS_ROUTES,
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./components/layouts/profile/profile.routes').then(
            (m) => m.PROFILE_ROUTES,
          ),
      },
      {
        path: 'worker',
        loadChildren: () =>
          import('./components/worker/worker.routes').then(
            (m) => m.WORKER_ROUTES,
          ),
      },
      {
        path: 'my-tasks',
        loadComponent: () =>
          import('./components/layouts/projects/components/my-tasks/my-tasks.component').then(
            (m) => m.MyTasksComponent,
          ),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./components/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: 'supervisor',
        loadChildren: () =>
          import('./components/supervisor/supervisor.routes').then(
            (m) => m.SUPERVISOR_ROUTES,
          ),
      },
      // Other protected routes will go here
    ],
  },
];
