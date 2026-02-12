import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, interval, Subscription } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as SignupActions from '../../store/signup.actions';
import * as SignupSelectors from '../../store/signup.selectors';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(
          '600ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate(
          '400ms 200ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
  ],
})
export class OtpVerificationComponent implements OnInit, OnDestroy {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private readonly store = inject(Store);

  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  email$: Observable<string | null>;

  otpDigits: string[] = ['', '', '', '', '', ''];
  countdown = 120; // 2 minutes in seconds
  canResend = false;
  private timerSubscription?: Subscription;

  constructor() {
    this.loading$ = this.store.select(SignupSelectors.selectLoading);
    this.error$ = this.store.select(SignupSelectors.selectError);
    this.email$ = this.store.select(SignupSelectors.selectEmail);
  }

  ngOnInit(): void {
    this.startCountdown();
    // Send OTP when component loads
    this.email$.pipe(take(1)).subscribe((email) => {
      if (email) {
        this.store.dispatch(SignupActions.sendOtp({ email }));
      }
    });
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  startCountdown(): void {
    this.countdown = 120;
    this.canResend = false;
    this.stopCountdown();

    this.timerSubscription = interval(1000)
      .pipe(take(120))
      .subscribe({
        next: () => {
          this.countdown--;
          if (this.countdown <= 0) {
            this.canResend = true;
          }
        },
        complete: () => {
          this.canResend = true;
        },
      });
  }

  stopCountdown(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  get formattedCountdown(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      input.value = this.otpDigits[index];
      return;
    }

    // Take only the last character if multiple are pasted
    this.otpDigits[index] = value.slice(-1);
    input.value = this.otpDigits[index];

    // Auto-focus next input
    if (value && index < 5) {
      const inputs = this.otpInputs.toArray();
      inputs[index + 1]?.nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const inputs = this.otpInputs.toArray();

    if (event.key === 'Backspace') {
      if (!this.otpDigits[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        inputs[index - 1]?.nativeElement.focus();
        this.otpDigits[index - 1] = '';
      } else {
        this.otpDigits[index] = '';
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputs[index - 1]?.nativeElement.focus();
    } else if (event.key === 'ArrowRight' && index < 5) {
      inputs[index + 1]?.nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    for (let i = 0; i < 6; i++) {
      this.otpDigits[i] = digits[i] || '';
    }

    // Update input values
    const inputs = this.otpInputs.toArray();
    inputs.forEach((input, i) => {
      input.nativeElement.value = this.otpDigits[i];
    });

    // Focus last filled input or first empty
    const lastFilledIndex = digits.length - 1;
    if (lastFilledIndex >= 0 && lastFilledIndex < 5) {
      inputs[lastFilledIndex + 1]?.nativeElement.focus();
    }
  }

  get otpCode(): string {
    return this.otpDigits.join('');
  }

  get isOtpComplete(): boolean {
    return this.otpDigits.every((d) => d !== '');
  }

  onSubmit(): void {
    if (this.isOtpComplete) {
      this.email$.pipe(take(1)).subscribe((email) => {
        if (email) {
          this.store.dispatch(
            SignupActions.verifyOtp({ email, otp: this.otpCode })
          );
        }
      });
    }
  }

  resendCode(): void {
    if (this.canResend) {
      this.email$.pipe(take(1)).subscribe((email) => {
        if (email) {
          this.store.dispatch(SignupActions.resendOtp({ email }));
          this.startCountdown();
        }
      });
    }
  }
}
