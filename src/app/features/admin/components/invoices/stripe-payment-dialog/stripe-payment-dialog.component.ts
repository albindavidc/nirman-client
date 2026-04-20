import { Component, OnInit, inject, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PaymentService } from '../../../services/payment.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';

@Component({
  selector: 'app-stripe-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './stripe-payment-dialog.component.html',
  styleUrl: './stripe-payment-dialog.component.scss'
})
export class StripePaymentDialogComponent implements OnInit, AfterViewInit {
  data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<StripePaymentDialogComponent>);
  private paymentService = inject(PaymentService);
  private notificationService = inject(NotificationService);

  @ViewChild('cardElement') cardElementRef!: ElementRef;

  stripe!: Stripe | null;
  elements!: StripeElements;
  card!: StripeCardElement;

  stripeLoaded = signal(false);
  processing = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.paymentService.getStripe().subscribe(stripe => {
      this.stripe = stripe;
      if (stripe) {
        this.stripeLoaded.set(true);
        this.initializeStripe();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.stripeLoaded()) {
      this.initializeStripe();
    }
  }

  initializeStripe(): void {
    if (!this.stripe || !this.cardElementRef) return;

    this.elements = this.stripe.elements();
    this.card = this.elements.create('card', {
      style: {
        base: {
          color: '#ffffff',
          fontFamily: '"Outfit", "Inter", sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#71717a'
          }
        },
        invalid: {
          color: '#f87171',
          iconColor: '#f87171'
        }
      }
    });

    this.card.mount(this.cardElementRef.nativeElement);
    this.card.on('change', (event) => {
      if (event.error) {
        this.error.set(event.error.message);
      } else {
        this.error.set(null);
      }
    });
  }

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.stripe || !this.card || this.processing()) return;

    this.processing.set(true);
    this.error.set(null);

    try {
      // 1. Initiate payment on backend to get client secret
      this.paymentService.initiatePayment({
        invoice_id: this.data.invoiceId,
        amount_to_pay: this.data.amount
      }).subscribe({
        next: async (res) => {
          const clientSecret = res.data.client_secret;

          // 2. Confirm payment on Stripe
          const result = await this.stripe!.confirmCardPayment(clientSecret, {
            payment_method: {
              card: this.card,
              billing_details: {
                name: 'Administrator', // Could be dynamic
              },
            },
          });

          if (result.error) {
            this.handleError(result.error.message || 'Payment failed');
          } else {
            if (result.paymentIntent.status === 'succeeded') {
              this.handleSuccess();
            }
          }
        },
        error: (err) => {
          this.handleError(err.error?.message || 'Failed to initiate payment');
        }
      });
    } catch {
      this.handleError('An unexpected error occurred');
    }
  }

  handleError(msg: string): void {
    this.error.set(msg);
    this.processing.set(false);
    this.notificationService.error(msg);
  }

  handleSuccess(): void {
    this.processing.set(false);
    this.notificationService.success('Payment successful!');
    this.dialogRef.close({ success: true });
  }

  close(): void {
    if (!this.processing()) {
      this.dialogRef.close();
    }
  }
}
