import { Routes } from '@angular/router';
import { AccountTypeSelectionComponent } from './components/account-type-selection/account-type-selection.component';
import { VendorStep1Component } from './components/vendor-step1/vendor-step1.component';
import { VendorStep2Component } from './components/vendor-step2/vendor-step2.component';
import { OtpVerificationComponent } from './components/otp-verification/otp-verification.component';
import { SignupSuccessComponent } from './components/signup-success/signup-success.component';
import { WorkerSignupComponent } from './components/worker-signup/worker-signup.component';

export const SIGNUP_ROUTES: Routes = [
  {
    path: '',
    component: AccountTypeSelectionComponent,
    title: 'Choose Account Type - Nirman',
  },
  {
    path: 'identify',
    loadComponent: () =>
      import('./components/identify/identify.component').then(
        (m) => m.IdentifyComponent,
      ),
    title: 'Find Account - Nirman',
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
  {
    path: 'vendor/verify-otp',
    component: OtpVerificationComponent,
    title: 'Verify Email - Nirman',
  },
  {
    path: 'vendor/success',
    component: SignupSuccessComponent,
    title: 'Signup Complete - Nirman',
  },
  {
    path: 'worker/complete',
    component: WorkerSignupComponent,
    title: 'Complete Profile - Nirman',
  },
];
