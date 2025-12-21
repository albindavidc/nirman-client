import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  VendorUserData,
  VendorCompanyData,
  Step1Response,
  Step2Response,
} from '../models/signup.models';

interface OtpResponse {
  message: string;
  email: string;
}

interface OtpVerifyResponse {
  message: string;
  verified: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth/vendor/signup`;
  private readonly otpUrl = `${environment.apiUrl}/auth/otp`;

  submitStep1(data: VendorUserData): Observable<Step1Response> {
    return this.http.post<Step1Response>(`${this.apiUrl}/step1`, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
  }

  submitStep2(data: VendorCompanyData): Observable<Step2Response> {
    return this.http.post<Step2Response>(`${this.apiUrl}/step2`, {
      userId: data.userId,
      companyName: data.companyName,
      registrationNumber: data.registrationNumber,
      taxNumber: data.taxNumber,
      yearsInBusiness: data.yearsInBusiness,
      addressStreet: data.addressStreet,
      addressCity: data.addressCity,
      addressState: data.addressState,
      addressZipCode: data.addressZipCode,
      productsServices: data.productsServices,
    });
  }

  sendOtp(email: string): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${this.otpUrl}/send`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<OtpVerifyResponse> {
    return this.http.post<OtpVerifyResponse>(`${this.otpUrl}/verify`, {
      email,
      otp,
    });
  }

  resendOtp(email: string): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${this.otpUrl}/resend`, { email });
  }
}
