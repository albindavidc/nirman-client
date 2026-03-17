import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { loginReducer } from './store/login.reducer';
import { LoginEffects } from './store/login.effects';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetVerifyOtpComponent } from './components/reset-verify-otp/reset-verify-otp.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

export const LOGIN_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState('login', loginReducer),
      provideEffects(LoginEffects),
    ],
    children: [
      {
        path: '',
        component: LoginComponent,
        title: 'Sign In - Nirman',
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        title: 'Forgot Password - Nirman',
      },
      {
        path: 'verify-reset-otp',
        component: ResetVerifyOtpComponent,
        title: 'Verify Code - Nirman',
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        title: 'Reset Password - Nirman',
      },
    ],
  },
];
