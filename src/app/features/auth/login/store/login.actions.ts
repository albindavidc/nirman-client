import { createAction, props } from '@ngrx/store';
import {
  LoginCredentials,
  LoginResponse,
  VerifyResetOtpResponse,
} from '../models/login.models';

// Login Actions
export const login = createAction(
  '[Login] Login',
  props<{ credentials: LoginCredentials }>()
);

export const loginSuccess = createAction(
  '[Login] Login Success',
  props<{ response: LoginResponse }>()
);

export const loginFailure = createAction(
  '[Login] Login Failure',
  props<{ error: string }>()
);

// Hydrate user from localStorage on app init
export const hydrateFromStorage = createAction(
  '[Login] Hydrate From Storage',
  props<{ user: LoginResponse['user'] }>()
);

// Validate session with backend after hydrating
export const validateSession = createAction('[Login] Validate Session');

export const validateSessionSuccess = createAction(
  '[Login] Validate Session Success',
  props<{ user: any }>()
);

export const validateSessionFailure = createAction(
  '[Login] Validate Session Failure'
);

// Forgot Password Actions
export const forgotPassword = createAction(
  '[Login] Forgot Password',
  props<{ email: string }>()
);

export const forgotPasswordSuccess = createAction(
  '[Login] Forgot Password Success',
  props<{ email: string }>()
);

export const forgotPasswordFailure = createAction(
  '[Login] Forgot Password Failure',
  props<{ error: string }>()
);

// Verify Reset OTP Actions
export const verifyResetOtp = createAction(
  '[Login] Verify Reset OTP',
  props<{ email: string; otp: string }>()
);

export const verifyResetOtpSuccess = createAction(
  '[Login] Verify Reset OTP Success',
  props<{ response: VerifyResetOtpResponse }>()
);

export const verifyResetOtpFailure = createAction(
  '[Login] Verify Reset OTP Failure',
  props<{ error: string }>()
);

// Resend Reset OTP Actions
export const resendResetOtp = createAction(
  '[Login] Resend Reset OTP',
  props<{ email: string }>()
);

export const resendResetOtpSuccess = createAction(
  '[Login] Resend Reset OTP Success'
);

export const resendResetOtpFailure = createAction(
  '[Login] Resend Reset OTP Failure',
  props<{ error: string }>()
);

// Reset Password Actions
export const resetPassword = createAction(
  '[Login] Reset Password',
  props<{ email: string; resetToken: string; newPassword: string }>()
);

export const resetPasswordSuccess = createAction(
  '[Login] Reset Password Success'
);

export const resetPasswordFailure = createAction(
  '[Login] Reset Password Failure',
  props<{ error: string }>()
);

// Utility Actions
export const logout = createAction('[Login] Logout');

export const clearError = createAction('[Login] Clear Error');

export const resetForgotPasswordFlow = createAction(
  '[Login] Reset Forgot Password Flow'
);

// Profile Update Action - updates user in store when profile is modified
export const updateUserProfile = createAction(
  '[Login] Update User Profile',
  props<{ user: Partial<LoginResponse['user']> }>()
);
