import {
  AccountType,
  VendorUserData,
  VendorCompanyData,
} from '../models/signup.models';

export interface SignupState {
  selectedAccountType: AccountType | null;
  step1Data: VendorUserData | null;
  step2Data: VendorCompanyData | null;
  userId: string | null;
  vendorId: string | null;
  email: string | null;
  otpVerified: boolean;
  currentStep: number;
  loading: boolean;
  error: string | null;
}

// Helper functions for localStorage persistence
const SIGNUP_STORAGE_KEY = 'signup_state';

export function getPersistedSignupState(): Partial<SignupState> {
  try {
    const stored = localStorage.getItem(SIGNUP_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Partial<SignupState>;
    }
  } catch {
    // Ignore localStorage errors
  }
  return {};
}

export function persistSignupState(state: Partial<SignupState>): void {
  try {
    localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore localStorage errors
  }
}

export function clearPersistedSignupState(): void {
  try {
    localStorage.removeItem(SIGNUP_STORAGE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

// Get any persisted state from localStorage
const persistedState = getPersistedSignupState();

export const initialSignupState: SignupState = {
  selectedAccountType: null,
  step1Data: null,
  step2Data: null,
  userId: persistedState.userId || null,
  vendorId: persistedState.vendorId || null,
  email: persistedState.email || null,
  otpVerified: false,
  currentStep: persistedState.currentStep || 0,
  loading: false,
  error: null,
};
