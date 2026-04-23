import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { ConfigService } from '../../../core/services/config.service';

export interface InitiatePaymentDto {
  invoice_id: string;
  amount_to_pay: number;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);
  private stripePromise = loadStripe('pk_test_51Npu0DQUsMoHJvCPHxWk7wmxOuSOHoxURvEkSUAvesh0HyubDHQ48iurCDIvRg6ffP88hvz6mM9T5suBtXMZnpeH00jX5MCSFy'); // Placeholder

  private get apiUrl(): string {
    return `${this.configService.apiUrl}/payments`;
  }

  initiatePayment(dto: InitiatePaymentDto): Observable<{ data: { client_secret: string } }> {
    return this.http.post<{ data: { client_secret: string } }>(
      `${this.apiUrl}/initiate`,
      dto
    );
  }

  getStripe(): Observable<Stripe | null> {
    return from(this.stripePromise);
  }
}
