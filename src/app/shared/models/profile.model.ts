export enum Role {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  VENDOR = 'vendor',
  WORKER = 'worker',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export interface ProfessionalDetails {
  id: string;
  userId: string;
  ProfessionalTitle: string;
  experienceYears: number;
  skills: string[];
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorDetails {
  id: string;
  userId: string;

  companyName: string;
  registrationNumber: string;
  taxNumber?: string;
  yearsInBusiness: number;

  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;

  productsServices: string[];
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;

  vendorStatus: AccountStatus;
  rejectionReason?: string;

  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profilePhotoUrl?: string;
  dateOfBirth?: string;

  role: Role;
  userStatus: AccountStatus;
  vendorStatus?: string;
  rejectionReason?: string;
  vendorId?: string;

  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  professional?: ProfessionalDetails;
  vendor?: VendorDetails;
  createdAt: Date;
  updatedAt: Date;
}

export type UpdateProfileDto = Partial<
  Pick<
    UserProfile,
    'firstName' | 'lastName' | 'phoneNumber' | 'profilePhotoUrl'
  >
>;

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}
