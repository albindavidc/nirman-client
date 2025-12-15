import { Routes } from '@angular/router';
import { AccountTypeSelectionComponent } from './components/account-type-selection/account-type-selection.component';
import { VendorStep1Component } from './components/vendor-step1/vendor-step1.component';
import { VendorStep2Component } from './components/vendor-step2/vendor-step2.component';

export const SIGNUP_ROUTES: Routes = [
  {
    path: '',
    component: AccountTypeSelectionComponent,
    title: 'Choose Account Type - Nirman',
  },
  {
    path: 'vendor/step1',
    component: VendorStep1Component,
    title: 'Company Representative - Nirman',
  },
  {
    path: 'vendor/step2',
    component: VendorStep2Component,
    title: 'Company Information - Nirman',
  },
];
