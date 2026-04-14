import { UserProfile } from '../../../../shared/models/profile.model';

export interface LoginState {
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  authHydrated: boolean;
  user: UserProfile | null;

  // Forgot password flow
  forgotPasswordEmail: string | null;
  forgotPasswordLoading: boolean;
  forgotPasswordSuccess: boolean;

  // OTP verification for password reset
  otpLoading: boolean;
  otpVerified: boolean;
  resetToken: string | null;

  // Reset password
  resetPasswordLoading: boolean;
  resetPasswordSuccess: boolean;
}

export const initialLoginState: LoginState = {
  isLoading: false,
  error: null,
  isLoggedIn: false,
  authHydrated: false,
  user: null,

  forgotPasswordEmail: null,
  forgotPasswordLoading: false,
  forgotPasswordSuccess: false,

  otpLoading: false,
  otpVerified: false,
  resetToken: null,

  resetPasswordLoading: false,
  resetPasswordSuccess: false,
};
