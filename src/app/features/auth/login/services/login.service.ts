import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../../core/services/config.service';
import {
  LoginCredentials,
  VerifyResetOtpResponse,
} from '../models/login.models';
import { UserProfile } from '../../../../shared/models/profile.model';
import { LoginResponse } from '../../../../shared/models/auth-signup.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);
  private readonly apiUrl = `${this.configService.apiUrl}/auth`;

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

  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`);
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/forgot-password`,
      {
        email,
      },
    );
  }

  verifyResetOtp(
    email: string,
    otp: string,
  ): Observable<VerifyResetOtpResponse> {
    return this.http.post<VerifyResetOtpResponse>(
      `${this.apiUrl}/verify-reset-otp`,
      {
        email,
        otp,
      },
    );
  }

  resendResetOtp(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/forgot-password`,
      {
        email,
      },
    );
  }

  resetPassword(
    email: string,
    resetToken: string,
    newPassword: string,
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/reset-password`,
      {
        email,
        resetToken,
        newPassword,
      },
    );
  }
}
