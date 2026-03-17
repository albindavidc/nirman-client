import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { vendorReducer } from './store/vendor.reducer';
import { VendorEffects } from './store/vendor.effects';
import { RoleGuard } from '../../core/guards/role.guard';

export const VENDOR_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./components/vendor-list/vendor-list.component').then(
        (m) => m.VendorListComponent,
      ),
    providers: [
      provideState('vendorManagement', vendorReducer),
      provideEffects([VendorEffects]),
    ],
  },
];
