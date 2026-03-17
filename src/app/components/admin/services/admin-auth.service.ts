import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse, SendOtpResponse, SignupRequest, SignupResponse, VerifyOtpResponse } from '../../../shared/models/auth-signup.model';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private apiUrl = `${environment.api.baseUrl}/api/${environment.api.version}/auth`;

  constructor(private http: HttpClient) {}

  adminSignup(signupData: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/admin/signup`, signupData);
  }

  verifyOtp(email: string, otp: string): Observable<VerifyOtpResponse> {
    return this.http.post<VerifyOtpResponse>(`${this.apiUrl}/otp/verify`, { email, otp });
  }

  adminLogin(loginData: LoginRequest): Observable<LoginResponse> {
    const { email, password } = loginData;
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  resendOtp(email: string): Observable<SendOtpResponse> {
    return this.http.post<SendOtpResponse>(`${this.apiUrl}/otp/resend`, { email });
  }
}
