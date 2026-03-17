import { SignupRequest } from '../../../shared/models/auth-signup.model';

export interface AdminAuthState {
  pendingSignupData: SignupRequest | null;
  userId: string | null;
  email: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const initialAdminAuthState: AdminAuthState = {
  pendingSignupData: (() => {
    try {
      const data = localStorage.getItem('admin_pending_signup');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  })(),
  userId: null,
  email: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};
