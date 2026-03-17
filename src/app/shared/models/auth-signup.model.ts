
import { BaseResponse } from './api.models';
import { UserProfile } from './profile.model';

export interface SignupRequest extends Pick<
  UserProfile,
  'firstName' | 'lastName' | 'email' | 'phoneNumber'
> {
  password: string;
}
export interface LoginRequest extends Pick<UserProfile, 'email'> {
  password: string;
}

export type SignupResponse = Pick<UserProfile, 'id' | 'email'>;
export type LoginResponse = BaseResponse<{ user: UserProfile }>;
export type SendOtpResponse = BaseResponse<{ email: UserProfile['email'] }>;
export type VerifyOtpResponse = BaseResponse<{ verified: boolean }>;
