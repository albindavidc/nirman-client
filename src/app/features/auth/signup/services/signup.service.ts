import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../../core/services/config.service';
import {
  VendorUserData,
  VendorCompanyData,
  Step1Response,
  Step2Response,
  WorkerSignupData,
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
  private readonly configService = inject(ConfigService);
  private readonly apiUrl = `${this.configService.apiUrl}/auth/vendor/signup`;
  private readonly otpUrl = `${this.configService.apiUrl}/auth/otp`;

  submitStep1(data: VendorUserData): Observable<Step1Response> {
    return this.http.post<Step1Response>(`${this.apiUrl}/step1`, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
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

  completeWorkerSignup(data: WorkerSignupData): Observable<unknown> {
    const signupData = { ...data } as Record<string, unknown>;
    delete signupData['confirmPassword'];
    return this.http.post(
      `${this.configService.apiUrl}/auth/worker/signup`,
      signupData,
    );
  }

  completeSupervisorSignup(data: WorkerSignupData): Observable<unknown> {
    const signupData = { ...data } as Record<string, unknown>;
    delete signupData['confirmPassword'];
    return this.http.post(
      `${this.configService.apiUrl}/auth/supervisor/signup`,
      signupData,
    );
  }

  sendOtp(
    email: string,
    role?: string,
    isSignup?: boolean,
  ): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${this.otpUrl}/send`, {
      email,
      role,
      isSignup,
    });
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
