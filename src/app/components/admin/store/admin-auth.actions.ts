import { createAction, props } from '@ngrx/store';

// Signup Actions
export const adminSignup = createAction(
  '[Admin Auth] Signup',
  props<{ signupData: any }>(),
);

export const adminSignupSuccess = createAction(
  '[Admin Auth] Signup Success',
  props<{ response: any; email: string }>(),
);

export const adminSignupFailure = createAction(
  '[Admin Auth] Signup Failure',
  props<{ error: string }>(),
);

// OTP Actions
export const verifyAdminOtp = createAction(
  '[Admin Auth] Verify OTP',
  props<{ email: string; otp: string }>(),
);

export const verifyAdminOtpSuccess = createAction(
  '[Admin Auth] Verify OTP Success',
  props<{ response: any }>(),
);

export const verifyAdminOtpFailure = createAction(
  '[Admin Auth] Verify OTP Failure',
  props<{ error: string }>(),
);

export const resendAdminOtp = createAction(
  '[Admin Auth] Resend OTP',
  props<{ email: string }>(),
);

export const resendAdminOtpSuccess = createAction(
  '[Admin Auth] Resend OTP Success'
);

export const resendAdminOtpFailure = createAction(
  '[Admin Auth] Resend OTP Failure',
  props<{ error: string }>(),
);

// Login Actions
export const adminLogin = createAction(
  '[Admin Auth] Login',
  props<{ loginData: any }>(),
);

export const adminLoginSuccess = createAction(
  '[Admin Auth] Login Success',
  props<{ response: any }>(),
);

export const adminLoginFailure = createAction(
  '[Admin Auth] Login Failure',
  props<{ error: string }>(),
);

// Local Store Actions (for persistence during flow)
export const savePendingSignupData = createAction(
  '[Admin Auth] Save Pending Signup Data',
  props<{ signupData: any }>(),
);

export const clearAdminAuthState = createAction('[Admin Auth] Clear State');
