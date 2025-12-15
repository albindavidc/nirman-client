import { createAction, props } from '@ngrx/store';
import {
  AccountType,
  VendorUserData,
  VendorCompanyData,
  Step1Response,
  Step2Response,
} from '../models/signup.models';

// Account Type Selection
export const selectAccountType = createAction(
  '[Signup] Select Account Type',
  props<{ accountType: AccountType }>()
);

// Step 1 Actions
export const submitStep1 = createAction(
  '[Signup] Submit Step 1',
  props<{ data: VendorUserData }>()
);

export const submitStep1Success = createAction(
  '[Signup] Submit Step 1 Success',
  props<{ response: Step1Response }>()
);

export const submitStep1Failure = createAction(
  '[Signup] Submit Step 1 Failure',
  props<{ error: string }>()
);

// Step 2 Actions
export const submitStep2 = createAction(
  '[Signup] Submit Step 2',
  props<{ data: VendorCompanyData }>()
);

export const submitStep2Success = createAction(
  '[Signup] Submit Step 2 Success',
  props<{ response: Step2Response }>()
);

export const submitStep2Failure = createAction(
  '[Signup] Submit Step 2 Failure',
  props<{ error: string }>()
);

// Reset
export const resetSignup = createAction('[Signup] Reset');

// Clear Error
export const clearError = createAction('[Signup] Clear Error');
