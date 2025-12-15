// Signup models and interfaces

export type AccountType = 'worker' | 'vendor' | 'supervisor';

export interface VendorUserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface VendorCompanyData {
  userId: string;
  companyName: string;
  registrationNumber: string;
  taxNumber?: string;
  businessType?: string;
  yearsInBusiness?: number;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  productsServices?: string[];
}

export interface Step1Response {
  message: string;
  userId: string;
  nextStep: string;
}

export interface Step2Response {
  message: string;
  vendorId: string;
}

export interface AccountTypeOption {
  type: AccountType;
  title: string;
  subtitle: string;
  icon: string;
  features: string[];
}
