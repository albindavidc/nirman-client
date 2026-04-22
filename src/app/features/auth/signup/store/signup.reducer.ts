import { createReducer, on } from '@ngrx/store';
import {
  initialSignupState,
  persistSignupState,
  clearPersistedSignupState,
} from './signup.state';
import * as SignupActions from './signup.actions';

export const signupReducer = createReducer(
  initialSignupState,

  // Account Type Selection
  on(SignupActions.selectAccountType, (state, { accountType }) => ({
    ...state,
    selectedAccountType: accountType,
    currentStep: 1,
  })),

  // Step 1
  on(SignupActions.submitStep1, (state, { data }) => ({
    ...state,
    step1Data: data,
    loading: true,
    error: null,
  })),

  on(SignupActions.submitStep1Success, (state, { response, email }) => {
    const newState = {
      ...state,
      userId: response.userId,
      email: email,
      currentStep: 2,
      loading: false,
      error: null,
    };
    // Persist userId, email, step1Data, and step to localStorage
    persistSignupState({
      userId: newState.userId,
      email: newState.email,
      step1Data: newState.step1Data,
      currentStep: newState.currentStep,
    });
    return newState;
  }),

  on(SignupActions.submitStep1Failure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Step 2
  on(SignupActions.submitStep2, (state, { data }) => ({
    ...state,
    step2Data: data,
    loading: true,
    error: null,
  })),

  on(SignupActions.submitStep2Success, (state, { response }) => {
    const newState = {
      ...state,
      vendorId: response.vendorId,
      currentStep: 3,
      loading: false,
      error: null,
    };
    // Persist vendorId and step to localStorage
    persistSignupState({
      userId: newState.userId,
      vendorId: newState.vendorId,
      email: newState.email,
      currentStep: newState.currentStep,
    });
    return newState;
  }),

  on(SignupActions.submitStep2Failure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // OTP
  on(SignupActions.sendOtp, (state, { email }) => ({
    ...state,
    email,
    loading: true,
    error: null,
  })),

  on(SignupActions.sendOtpSuccess, (state) => ({
    ...state,
    loading: false,
  })),

  on(SignupActions.sendOtpFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(SignupActions.verifyOtp, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(SignupActions.verifyOtpSuccess, (state) => {
    // Clear persisted state after successful verification
    clearPersistedSignupState();
    return {
      ...state,
      otpVerified: true,
      loading: false,
    };
  }),

  on(SignupActions.verifyOtpFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(SignupActions.resendOtp, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(SignupActions.resendOtpSuccess, (state) => ({
    ...state,
    loading: false,
  })),

  on(SignupActions.resendOtpFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Reset
  on(SignupActions.resetSignup, () => {
    // Clear persisted state on reset
    clearPersistedSignupState();
    return initialSignupState;
  }),

  // Clear Error
  on(SignupActions.clearError, (state) => ({
    ...state,
    error: null,
  })),
);
