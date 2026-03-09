import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminAuthState } from './admin-auth.state';

export const selectAdminAuthState = createFeatureSelector<AdminAuthState>('adminAuth');

export const selectPendingSignupData = createSelector(
  selectAdminAuthState,
  (state) => state?.pendingSignupData
);

export const selectAdminAuthLoading = createSelector(
  selectAdminAuthState,
  (state) => state?.loading || false
);

export const selectAdminAuthError = createSelector(
  selectAdminAuthState,
  (state) => state?.error
);

export const selectAdminEmail = createSelector(
  selectAdminAuthState,
  (state) => state?.email
);

export const selectIsAdminAuthenticated = createSelector(
  selectAdminAuthState,
  (state) => state?.isAuthenticated || false
);
