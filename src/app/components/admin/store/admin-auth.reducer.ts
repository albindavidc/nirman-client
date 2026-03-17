import { createReducer, on } from '@ngrx/store';
import { initialAdminAuthState } from './admin-auth.state';
import * as AdminAuthActions from './admin-auth.actions';

export const adminAuthReducer = createReducer(
  initialAdminAuthState,

  on(
    AdminAuthActions.AdminAuthActions.savePendingSignupData,
    (state, { signupData }) => {
      localStorage.setItem('admin_pending_signup', JSON.stringify(signupData));
      return {
        ...state,
        pendingSignupData: signupData,
      };
    },
  ),

  on(AdminAuthActions.AdminAuthActions.signup, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(
    AdminAuthActions.AdminAuthActions.signupSuccess,
    (state, { response, email }) => ({
      ...state,
      loading: false,
      userId: response.id,
      email: email,
    }),
  ),

  on(AdminAuthActions.AdminAuthActions.signupFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AdminAuthActions.AdminAuthActions.verifyOTP, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AdminAuthActions.AdminAuthActions.verifyOTPSuccess, (state) => {
    localStorage.removeItem('admin_pending_signup');
    return {
      ...state,
      loading: false,
      pendingSignupData: null,
    };
  }),

  on(
    AdminAuthActions.AdminAuthActions.verifyOTPFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
    }),
  ),

  on(AdminAuthActions.AdminAuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AdminAuthActions.AdminAuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    isAuthenticated: true,
    // Add logic to save tokens if necessary
  })),

  on(AdminAuthActions.AdminAuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AdminAuthActions.AdminAuthActions.clearState, () => {
    localStorage.removeItem('admin_pending_signup');
    return initialAdminAuthState;
  }),
);
