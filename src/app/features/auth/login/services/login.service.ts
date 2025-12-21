import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  LoginCredentials,
  LoginResponse,
  ForgotPasswordRequest,
  VerifyResetOtpRequest,
  VerifyResetOtpResponse,
  ResetPasswordRequest,
} from '../models/login.models';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email: credentials.email,
      password: credentials.password,
    });
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/logout`, {});
  }

  refreshToken(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/refresh`, {});
  }

  getMe(): Observable<{ id: string; email: string; role: string }> {
    return this.http.get<{ id: string; email: string; role: string }>(
      `${this.apiUrl}/me`
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/forgot-password`,
      {
        email,
      }
    );
  }

  verifyResetOtp(
    email: string,
    otp: string
  ): Observable<VerifyResetOtpResponse> {
    return this.http.post<VerifyResetOtpResponse>(
      `${this.apiUrl}/verify-reset-otp`,
      {
        email,
        otp,
      }
    );
  }

  resendResetOtp(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/forgot-password`,
      {
        email,
      }
    );
  }

  resetPassword(
    email: string,
    resetToken: string,
    newPassword: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/reset-password`,
      {
        email,
        resetToken,
        newPassword,
      }
    );
  }
}
