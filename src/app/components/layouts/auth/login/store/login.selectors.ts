import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LoginState } from './login.state';

export const selectLoginState = createFeatureSelector<LoginState>('login');

// Login selectors
export const selectIsLoading = createSelector(
  selectLoginState,
  (state) => state.isLoading
);

export const selectError = createSelector(
  selectLoginState,
  (state) => state.error
);

export const selectIsLoggedIn = createSelector(
  selectLoginState,
  (state) => state.isLoggedIn
);

export const selectUser = createSelector(
  selectLoginState,
  (state) => state.user
);

export const selectAccessToken = createSelector(
  selectLoginState,
  (state) => state.accessToken
);

// Forgot password selectors
export const selectForgotPasswordEmail = createSelector(
  selectLoginState,
  (state) => state.forgotPasswordEmail
);

export const selectForgotPasswordLoading = createSelector(
  selectLoginState,
  (state) => state.forgotPasswordLoading
);

export const selectForgotPasswordSuccess = createSelector(
  selectLoginState,
  (state) => state.forgotPasswordSuccess
);

// OTP verification selectors
export const selectOtpLoading = createSelector(
  selectLoginState,
  (state) => state.otpLoading
);

export const selectOtpVerified = createSelector(
  selectLoginState,
  (state) => state.otpVerified
);

export const selectResetToken = createSelector(
  selectLoginState,
  (state) => state.resetToken
);

// Reset password selectors
export const selectResetPasswordLoading = createSelector(
  selectLoginState,
  (state) => state.resetPasswordLoading
);

export const selectResetPasswordSuccess = createSelector(
  selectLoginState,
  (state) => state.resetPasswordSuccess
);
