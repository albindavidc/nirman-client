import { createReducer, on } from '@ngrx/store';
import { initialLoginState } from './login.state';
import * as LoginActions from './login.actions';

export const loginReducer = createReducer(
  initialLoginState,

  // Login
  on(LoginActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(LoginActions.loginSuccess, (state, { response }) => ({
    ...state,
    isLoading: false,
    isLoggedIn: true,
    user: response.user,
    accessToken: response.accessToken,
    error: null,
  })),

  on(LoginActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Hydrate from localStorage on app init
  on(LoginActions.hydrateFromStorage, (state, { user }) => ({
    ...state,
    isLoggedIn: true,
    user,
  })),

  // Session validation from backend
  on(LoginActions.validateSessionSuccess, (state, { user }) => ({
    ...state,
    isLoggedIn: true,
    user: {
      ...state.user,
      ...user, // Merge all fields from backend user (including profilePhotoUrl)
    },
  })),

  on(LoginActions.validateSessionFailure, (state) => ({
    ...state,
    isLoggedIn: false,
    user: null,
  })),

  // Forgot Password
  on(LoginActions.forgotPassword, (state, { email }) => ({
    ...state,
    forgotPasswordLoading: true,
    forgotPasswordEmail: email,
    error: null,
  })),

  on(LoginActions.forgotPasswordSuccess, (state, { email }) => ({
    ...state,
    forgotPasswordLoading: false,
    forgotPasswordSuccess: true,
    forgotPasswordEmail: email,
  })),

  on(LoginActions.forgotPasswordFailure, (state, { error }) => ({
    ...state,
    forgotPasswordLoading: false,
    error,
  })),

  // Verify Reset OTP
  on(LoginActions.verifyResetOtp, (state) => ({
    ...state,
    otpLoading: true,
    error: null,
  })),

  on(LoginActions.verifyResetOtpSuccess, (state, { response }) => ({
    ...state,
    otpLoading: false,
    otpVerified: true,
    resetToken: response.resetToken,
  })),

  on(LoginActions.verifyResetOtpFailure, (state, { error }) => ({
    ...state,
    otpLoading: false,
    error,
  })),

  // Resend Reset OTP
  on(LoginActions.resendResetOtp, (state) => ({
    ...state,
    otpLoading: true,
    error: null,
  })),

  on(LoginActions.resendResetOtpSuccess, (state) => ({
    ...state,
    otpLoading: false,
  })),

  on(LoginActions.resendResetOtpFailure, (state, { error }) => ({
    ...state,
    otpLoading: false,
    error,
  })),

  // Reset Password
  on(LoginActions.resetPassword, (state) => ({
    ...state,
    resetPasswordLoading: true,
    error: null,
  })),

  on(LoginActions.resetPasswordSuccess, (state) => ({
    ...state,
    resetPasswordLoading: false,
    resetPasswordSuccess: true,
  })),

  on(LoginActions.resetPasswordFailure, (state, { error }) => ({
    ...state,
    resetPasswordLoading: false,
    error,
  })),

  // Logout
  on(LoginActions.logout, () => initialLoginState),

  // Clear Error
  on(LoginActions.clearError, (state) => ({
    ...state,
    error: null,
  })),

  // Reset Forgot Password Flow
  on(LoginActions.resetForgotPasswordFlow, (state) => ({
    ...state,
    forgotPasswordEmail: null,
    forgotPasswordLoading: false,
    forgotPasswordSuccess: false,
    otpLoading: false,
    otpVerified: false,
    resetToken: null,
    resetPasswordLoading: false,
    resetPasswordSuccess: false,
    error: null,
  })),

  // Update User Profile - sync profile changes (including photo) across the app
  on(LoginActions.updateUserProfile, (state, { user }) => ({
    ...state,
    user: state.user ? { ...state.user, ...user } : null,
  }))
);
