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
  currentStep: number;
  loading: boolean;
  error: string | null;
}

export const initialSignupState: SignupState = {
  selectedAccountType: null,
  step1Data: null,
  step2Data: null,
  userId: null,
  vendorId: null,
  currentStep: 0,
  loading: false,
  error: null,
};
