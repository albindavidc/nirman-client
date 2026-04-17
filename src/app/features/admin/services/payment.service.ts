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
  private stripePromise = loadStripe('pk_test_51P7qGvSInT8R32vUuJ9G11F6S6K7j4R5k6m7N8P9Q0R1S2T3U4V5W6X7Y8Z9'); // Placeholder

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
