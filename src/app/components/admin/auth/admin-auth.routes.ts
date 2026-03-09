import { Routes } from '@angular/router';
import { AdminLoginComponent } from './login/admin-login.component';
import { AdminSignupComponent } from './signup/admin-signup.component';
import { AdminOtpComponent } from './otp/admin-otp.component';

export const ADMIN_AUTH_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'login', component: AdminLoginComponent, title: 'Admin Login - Nirman' },
      { path: 'signup', component: AdminSignupComponent, title: 'Admin Signup - Nirman' },
      { path: 'otp', component: AdminOtpComponent, title: 'Verify OTP - Nirman' }
    ]
  }
];
