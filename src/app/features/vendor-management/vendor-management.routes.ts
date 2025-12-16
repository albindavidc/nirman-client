import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { vendorReducer } from './store/vendor.reducer';
import { VendorEffects } from './store/vendor.effects';

export const vendorManagementRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/vendor-list/vendor-list.component').then(
        (m) => m.VendorListComponent
      ),
    providers: [
      provideState('vendorManagement', vendorReducer),
      provideEffects([VendorEffects]),
    ],
  },
];
