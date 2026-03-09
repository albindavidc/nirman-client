import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { HomeComponent } from './shared/components/home/home.component';

export const routes: Routes = [
  // 1. Exact Home Route
  {
    path: '',
    component: HomeComponent,
    canActivate: [GuestGuard],
    pathMatch: 'full',
  },

  // 2. Redirects for Admin Auth (Compatibility & Request)
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

  // 3. Dedicated Admin OTP
  {
    path: 'auth/admin/otp',
    canActivate: [GuestGuard],
    loadComponent: () =>
      import('./components/admin/auth/otp/admin-otp.component').then(
        (m) => m.AdminOtpComponent
      ),
  },

  // 4. Auth Protection Pages
  {
    path: 'auth/pending-approval',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import(
        './components/layouts/auth/pages/pending-approval/pending-approval.component'
      ).then((m) => m.PendingApprovalComponent),
  },
  {
    path: 'auth/application-rejected',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import(
        './components/layouts/auth/pages/application-rejected/application-rejected.component'
      ).then((m) => m.ApplicationRejectedComponent),
  },

  // 5. General Auth Routes (Handles /auth/signup and /auth/login)
  {
    path: 'auth',
    canActivate: [GuestGuard],
    loadChildren: () =>
      import('./components/layouts/auth/auth.routes').then(
        (m) => m.AUTH_ROUTES,
      ),
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
    ],
  },

  // 7. Final Fallback
  { path: '**', redirectTo: '/auth/admin/login'  },
];
