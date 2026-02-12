import { LoginCredentials, LoginResponse } from '../models/login.models';

export interface LoginState {
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  user: LoginResponse['user'] | null;
  accessToken: string | null;

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
  user: null,
  accessToken: null,

  forgotPasswordEmail: null,
  forgotPasswordLoading: false,
  forgotPasswordSuccess: false,

  otpLoading: false,
  otpVerified: false,
  resetToken: null,

  resetPasswordLoading: false,
  resetPasswordSuccess: false,
};
