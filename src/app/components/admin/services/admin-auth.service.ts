import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private apiUrl = `${environment.api.baseUrl}/api/${environment.api.version}/auth`;

  constructor(private http: HttpClient) {}

  adminSignup(signupData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/signup`, signupData);
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/otp/verify`, { email, otp });
  }

  adminLogin(loginData: any): Observable<any> {
    const { email, password } = loginData;
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/otp/resend`, { email });
  }
}
