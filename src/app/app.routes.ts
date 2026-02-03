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
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
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
          import('./features/vendor-management/vendor-management.routes').then(
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
        path: 'project-members',
        loadChildren: () =>
          import('./features/project-members/project-members.routes').then(
            (m) => m.PROJECT_MEMBERS_ROUTES,
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then(
            (m) => m.SETTINGS_ROUTES,
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.routes').then(
            (m) => m.PROFILE_ROUTES,
          ),
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('./features/projects/projects.routes').then(
            (m) => m.PROJECTS_ROUTES,
          ),
      },
      {
        path: 'my-tasks',
        loadComponent: () =>
          import('./features/projects/components/my-tasks/my-tasks.component').then(
            (m) => m.MyTasksComponent,
          ),
      },
      // Other protected routes will go here
    ],
  },
];
