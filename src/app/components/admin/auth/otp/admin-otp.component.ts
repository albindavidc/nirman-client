import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { verifyAdminOtp, resendAdminOtp } from '../../store/admin-auth.actions';
import { selectAdminEmail, selectAdminAuthLoading, selectAdminAuthError } from '../../store/admin-auth.selectors';
import { CommonModule } from '@angular/common';
import { Observable, interval, Subscription, takeWhile } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { AuthLogoComponent } from '../../../layouts/auth/auth-logo/auth-logo.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-admin-otp',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule, 
    RouterModule,
    AuthLogoComponent
  ],
  templateUrl: './admin-otp.component.html',
  styleUrls: ['./admin-otp.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms 200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class AdminOtpComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private timerSubscription?: Subscription;

  otpDigits = signal<string[]>(['', '', '', '', '', '']);
  countdown = signal(120); // 2 minutes
  canResend = signal(false);

  email$ = this.store.select(selectAdminEmail);
  isLoading$ = this.store.select(selectAdminAuthLoading);
  error$ = this.store.select(selectAdminAuthError);

  formattedTime = computed(() => {
    const mins = Math.floor(this.countdown() / 60);
    const secs = this.countdown() % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  isComplete = computed(() => {
    return this.otpDigits().every((digit) => digit !== '');
  });

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  startTimer(): void {
    this.countdown.set(120);
    this.canResend.set(false);

    this.timerSubscription?.unsubscribe();
    this.timerSubscription = interval(1000)
      .pipe(takeWhile(() => this.countdown() > 0))
      .subscribe(() => {
        this.countdown.update((v) => v - 1);
        if (this.countdown() === 0) {
          this.canResend.set(true);
        }
      });
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(-1);

    this.otpDigits.update((digits) => {
      const newDigits = [...digits];
      newDigits[index] = value;
      return newDigits;
    });

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otpDigits()[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData
      ?.getData('text')
      ?.replace(/\D/g, '')
      .slice(0, 6);
    if (pastedData) {
      const digits = pastedData.split('');
      this.otpDigits.set([...digits, ...Array(6 - digits.length).fill('')]);

      // Focus last filled input or next empty
      const focusIndex = Math.min(digits.length, 5);
      const input = document.getElementById(`otp-${focusIndex}`) as HTMLInputElement;
      input?.focus();
    }
  }

  onSubmit(): void {
    if (this.isComplete()) {
      const otp = this.otpDigits().join('');
      this.email$
        .pipe(takeWhile((email) => email !== null, true))
        .subscribe((email) => {
          if (email) {
            this.store.dispatch(verifyAdminOtp({ email, otp }));
          }
        })
        .unsubscribe();
    }
  }

  resendOtp(): void {
    this.email$
      .pipe(takeWhile((email) => email !== null, true))
      .subscribe((email) => {
        if (email) {
          this.store.dispatch(resendAdminOtp({ email }));
          this.startTimer();
        }
      })
      .unsubscribe();
  }
}
