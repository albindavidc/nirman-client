import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  LoginRequest,
  SendOtpResponse,
  SignupRequest,
  SignupResponse,
  VerifyOtpResponse,
} from '../../../shared/models/auth-signup.model';

// Signup Actions

export const AdminAuthActions = createActionGroup({
  source: 'Admin Auth',
  events: {
    Signup: props<{ signupData: SignupRequest }>(),
    'Signup Success': props<{ response: SignupResponse; email: string }>(),
    'Signup Failure': props<{ error: string }>(),

    'Verify OTP': props<{ email: string; otp: string }>(),
    'Verify OTP Success': props<{ response: VerifyOtpResponse }>(),
    'Verify OTP Failure': props<{ error: string }>(),

    'Resend OTP': props<{ email: string }>(),
    'Resend OTP Success': props<{ response: SendOtpResponse }>(),
    'Resend OTP Failure': props<{ error: string }>(),

    Login: props<{ loginData: LoginRequest }>(),
    'Login Success': props<{ response: any }>(),
    'Login Failure': props<{ error: string }>(),

    'Save Pending Signup Data': props<{ signupData: SignupRequest }>(),
    'Clear State': emptyProps(),
  },
});
