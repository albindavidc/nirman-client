import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SignupState } from './signup.state';

export const selectSignupState = createFeatureSelector<SignupState>('signup');

export const selectAccountType = createSelector(
  selectSignupState,
  (state) => state.selectedAccountType
);

export const selectCurrentStep = createSelector(
  selectSignupState,
  (state) => state.currentStep
);

export const selectStep1Data = createSelector(
  selectSignupState,
  (state) => state.step1Data
);

export const selectStep2Data = createSelector(
  selectSignupState,
  (state) => state.step2Data
);

export const selectUserId = createSelector(
  selectSignupState,
  (state) => state.userId
);

export const selectVendorId = createSelector(
  selectSignupState,
  (state) => state.vendorId
);

export const selectEmail = createSelector(
  selectSignupState,
  (state) => state.email
);

export const selectOtpVerified = createSelector(
  selectSignupState,
  (state) => state.otpVerified
);

export const selectLoading = createSelector(
  selectSignupState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectSignupState,
  (state) => state.error
);
