export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePhotoUrl: string | null;
  role: string;
  userStatus: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePhotoUrl?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SettingsState {
  profile: UserProfile | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  updateSuccess: boolean;
  passwordUpdateSuccess: boolean;
}
