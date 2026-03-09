import { createReducer, on } from '@ngrx/store';
import { initialAdminAuthState } from './admin-auth.state';
import * as AdminAuthActions from './admin-auth.actions';

export const adminAuthReducer = createReducer(
  initialAdminAuthState,

  on(AdminAuthActions.savePendingSignupData, (state, { signupData }) => {
    localStorage.setItem('admin_pending_signup', JSON.stringify(signupData));
    return {
      ...state,
      pendingSignupData: signupData,
    };
  }),

  on(AdminAuthActions.adminSignup, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AdminAuthActions.adminSignupSuccess, (state, { response, email }) => ({
    ...state,
    loading: false,
    userId: response.userId,
    email: email,
  })),

  on(AdminAuthActions.adminSignupFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AdminAuthActions.verifyAdminOtp, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AdminAuthActions.verifyAdminOtpSuccess, (state) => {
    localStorage.removeItem('admin_pending_signup');
    return {
      ...state,
      loading: false,
      pendingSignupData: null,
    };
  }),

  on(AdminAuthActions.verifyAdminOtpFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AdminAuthActions.adminLogin, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AdminAuthActions.adminLoginSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    isAuthenticated: true,
    // Add logic to save tokens if necessary
  })),

  on(AdminAuthActions.adminLoginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AdminAuthActions.clearAdminAuthState, () => {
    localStorage.removeItem('admin_pending_signup');
    return initialAdminAuthState;
  })
);
