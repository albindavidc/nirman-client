import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { VendorStatusGuard } from '../../core/guards/vendor-status.guard';

export const VENDOR_ROUTES: Routes = [
  {
    path: '',
    canActivate: [RoleGuard, VendorStatusGuard],
    data: { roles: ['admin', 'vendor'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => 
          import('./components/vendor-dashboard/vendor-dashboard.component').then(
            (m) => m.VendorDashboardComponent
          ),
      },
      {
        path: 'purchase-orders',
        loadComponent: () => 
          import('./components/vendor-purchase-orders/vendor-purchase-orders.component').then(
            (m) => m.VendorPurchaseOrdersComponent
          ),
      },
      {
        path: 'purchase-orders/:poId/create-invoice',
        loadComponent: () => 
          import('./components/create-invoice/create-invoice.component').then(
            (m) => m.CreateInvoiceComponent
          ),
      }
    ]
  }
];
