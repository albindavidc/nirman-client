import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { RoleGuard } from './core/guards/role.guard';
import { VendorStatusGuard } from './core/guards/vendor-status.guard';
import { HomeComponent } from './shared/components/home/home.component';

export const routes: Routes = [
  // 1. Exact Home Route
  {
    path: '',
    component: HomeComponent,
    canActivate: [GuestGuard],
    pathMatch: 'full',
  },

  // 2. Unified Redirects for Admin Auth
  {
    path: 'admin/auth',
    redirectTo: '/auth/login?role=admin',
    pathMatch: 'prefix',
  },
  {
    path: 'auth/admin',
    redirectTo: '/auth/login?role=admin',
    pathMatch: 'full',
  },
  {
    path: 'auth/admin/signup',
    redirectTo: '/auth/signup?role=admin',
    pathMatch: 'full',
  },
  {
    path: 'auth/admin/login',
    redirectTo: '/auth/login?role=admin',
    pathMatch: 'full',
  },

  // 2b. Unified Redirects for Supervisor Auth
  {
    path: 'supervisor/auth',
    redirectTo: '/auth/login?role=supervisor',
    pathMatch: 'prefix',
  },
  {
    path: 'auth/supervisor',
    redirectTo: '/auth/login?role=supervisor',
    pathMatch: 'full',
  },
  {
    path: 'auth/supervisor/login',
    redirectTo: '/auth/login?role=supervisor',
    pathMatch: 'full',
  },

  // 2c. Unified Redirects for Worker Auth
  {
    path: 'worker/auth',
    redirectTo: '/auth/login?role=worker',
    pathMatch: 'prefix',
  },
  {
    path: 'auth/worker',
    redirectTo: '/auth/login?role=worker',
    pathMatch: 'full',
  },
  {
    path: 'auth/worker/login',
    redirectTo: '/auth/login?role=worker',
    pathMatch: 'full',
  },

  // 3. Dedicated Admin OTP
  {
    path: 'auth/admin/otp',
    canActivate: [GuestGuard],
    loadComponent: () =>
      import('./features/admin/components/auth/otp/admin-otp.component').then(
        (m) => m.AdminOtpComponent,
      ),
  },

  // 4. Auth Protection Pages
  {
    path: 'auth/pending-approval',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/auth/pages/pending-approval/pending-approval.component').then(
        (m) => m.PendingApprovalComponent,
      ),
  },
  {
    path: 'auth/application-rejected',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/auth/pages/application-rejected/application-rejected.component').then(
        (m) => m.ApplicationRejectedComponent,
      ),
  },

  // 5. General Auth Routes (Handles /auth/signup and /auth/login)
  {
    path: 'auth',
    canActivate: [GuestGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // 6. Main Protected Section (Catch-all prefix '')
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./shared/components/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    children: [
      {
        path: 'vendor-management',
        loadChildren: () =>
          import('./features/vendor/vendor-management.routes').then(
            (m) => m.VENDOR_MANAGEMENT_ROUTES,
          ),
      },
      {
        path: 'vendor',
        children: [
          {
            path: 'dashboard',
            canActivate: [RoleGuard, VendorStatusGuard],
            data: { roles: ['admin', 'vendor'] },
            loadComponent: () =>
              import('./shared/components/dashboard/dashboard.component').then(
                (m) => m.DashboardComponent,
              ),
          },
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
        ],
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
          import('./features/shared-features/settings/settings.routes').then(
            (m) => m.SETTINGS_ROUTES,
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/shared-features/profile/profile.routes').then(
            (m) => m.PROFILE_ROUTES,
          ),
      },
      {
        path: 'worker',
        loadChildren: () =>
          import('./features/worker/worker.routes').then(
            (m) => m.WORKER_ROUTES,
          ),
      },
      {
        path: 'worker-tasks',
        loadComponent: () =>
          import('./features/shared-features/worker-tasks/worker-tasks.component').then(
            (m) => m.WorkerTasksComponent,
          ),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: 'communication',
        loadChildren: () =>
          import('./features/shared-features/communication/communication.routes').then(
            (m) => m.COMMUNICATION_ROUTES,
          ),
      },
      {
        path: 'supervisor',
        loadChildren: () =>
          import('./features/supervisor/supervisor.routes').then(
            (m) => m.SUPERVISOR_ROUTES,
          ),
      },
    ],
  },

  // 7. Final Fallback
  { path: '**', redirectTo: '/auth/admin/login' },
];
