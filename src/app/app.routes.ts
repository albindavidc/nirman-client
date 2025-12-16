import { Routes } from '@angular/router';
import { HomeComponent } from './shared/componenets/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () =>
      import('./core/components/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'vendor-management',
        loadChildren: () =>
          import('./features/vendor-management/vendor-management.routes').then(
            (m) => m.vendorManagementRoutes
          ),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./shared/components/dashboard/dashboard.routes').then(
            (m) => m.dashboardRoutes
          ),
      },
      // Other protected routes will go here
    ],
  },
];
