export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}


export interface VerifyResetOtpResponse {
  resetToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyResetOtpResponse {
  resetToken: string;
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}
