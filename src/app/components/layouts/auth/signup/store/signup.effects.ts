import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  map,
  exhaustMap,
  catchError,
  tap,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { SignupService } from '../services/signup.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import * as SignupActions from './signup.actions';
import * as SignupSelectors from './signup.selectors';

@Injectable()
export class SignupEffects {
  private readonly actions$ = inject(Actions);
  private readonly signupService = inject(SignupService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private readonly store = inject(Store);

  /**
   * Converts backend error messages to user-friendly messages
   */
  private getErrorMessage(error: unknown, defaultMessage: string): string {
    const httpError = error as { error?: { message?: string } };
    const message = httpError?.error?.message || defaultMessage;

    // Map technical error messages to user-friendly ones
    const errorMappings: Record<string, string> = {
      'Database Error':
        'We are experiencing technical difficulties. Please try again later.',
      'Server selection timeout':
        'We are experiencing technical difficulties. Please try again later.',
      'No available servers':
        'We are experiencing technical difficulties. Please try again later.',
      'Internal Server Error': 'Something went wrong. Please try again later.',
      connection:
        'Unable to connect to the server. Please check your internet connection.',
    };

    // Check if the message contains any technical error keywords
    for (const [keyword, friendlyMessage] of Object.entries(errorMappings)) {
      if (message.toLowerCase().includes(keyword.toLowerCase())) {
        return friendlyMessage;
      }
    }

    return message;
  }

  submitStep1$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SignupActions.submitStep1),
      exhaustMap(({ data }) =>
        this.signupService.submitStep1(data).pipe(
          map((response) =>
            SignupActions.submitStep1Success({ response, email: data.email }),
          ),
          catchError((error) =>
            of(
              SignupActions.submitStep1Failure({
                error: this.getErrorMessage(
                  error,
                  'Failed to create your account. Please try again.',
                ),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  submitStep1Success$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SignupActions.submitStep1Success),
        tap(() => {
          this.router.navigate(['/auth/signup/vendor/step2']);
        }),
      ),
    { dispatch: false },
  );

  submitStep2$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SignupActions.submitStep2),
      exhaustMap(({ data }) =>
        this.signupService.submitStep2(data).pipe(
          map((response) => SignupActions.submitStep2Success({ response })),
          catchError((error) =>
            of(
              SignupActions.submitStep2Failure({
                error: this.getErrorMessage(
                  error,
                  'Failed to save company details. Please try again.',
                ),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  submitStep2Success$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SignupActions.submitStep2Success),
      tap(() => {
        this.router.navigate(['/auth/signup/vendor/verify-otp']);
      }),
      // Trigger sending OTP after step2 success
      switchMap(() => {
        // Get email from store - we'll dispatch sendOtp action
        return of(SignupActions.sendOtpSuccess()); // Placeholder, actual OTP sent below
      }),
    ),
  );

  // Trigger OTP send after navigating to OTP page
  sendOtpOnStep2Success$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SignupActions.submitStep2Success),
      map(() => {
        // The email will be retrieved from the store in the component
        // and dispatched from there, or we can trigger it here
        return SignupActions.sendOtpSuccess(); // OTP will be sent when component loads
      }),
    ),
  );

  sendOtp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SignupActions.sendOtp),
      exhaustMap(({ email }) =>
        this.signupService.sendOtp(email).pipe(
          map(() => {
            this.notification.success('Verification code sent to your email');
            // Navigate to verify OTP page
            this.router.navigate(['/auth/signup/vendor/verify-otp']);
            return SignupActions.sendOtpSuccess();
          }),

          catchError((error) => {
            const errorMessage = this.getErrorMessage(
              error,
              'Failed to send verification code. Please try again.',
            );
            this.notification.error(errorMessage);
            return of(
              SignupActions.sendOtpFailure({
                error: errorMessage,
              }),
            );
          }),
        ),
      ),
    ),
  );

  verifyOtp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SignupActions.verifyOtp),
      exhaustMap(({ email, otp }) =>
        this.signupService.verifyOtp(email, otp).pipe(
          map(() => SignupActions.verifyOtpSuccess()),
          catchError((error) =>
            of(
              SignupActions.verifyOtpFailure({
                error: this.getErrorMessage(
                  error,
                  'Invalid verification code. Please check and try again.',
                ),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  verifyOtpSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SignupActions.verifyOtpSuccess),
        withLatestFrom(this.store.select(SignupSelectors.selectAccountType)),
        tap(([_, accountType]) => {
          this.notification.success('Email verified successfully');

          if (accountType === 'worker') {
            this.router.navigate(['/auth/signup/worker/complete']);
          } else {
            this.router.navigate(['/auth/signup/vendor/success']);
          }
        }),
      ),
    { dispatch: false },
  );

  resendOtp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SignupActions.resendOtp),
      exhaustMap(({ email }) =>
        this.signupService.resendOtp(email).pipe(
          map(() => {
            this.notification.success('Verification code resent');
            return SignupActions.resendOtpSuccess();
          }),
          catchError((error) => {
            const errorMessage = this.getErrorMessage(
              error,
              'Failed to resend verification code. Please try again.',
            );
            this.notification.error(errorMessage);
            return of(
              SignupActions.resendOtpFailure({
                error: errorMessage,
              }),
            );
          }),
        ),
      ),
    ),
  );

  selectAccountType$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SignupActions.selectAccountType),
        tap(({ accountType }) => {
          if (accountType === 'vendor') {
            // Vendor goes to login with role param (for vendor-specific signup link)
            this.router.navigate(['/auth/login'], {
              queryParams: { role: 'vendor' },
            });
          } else if (accountType === 'worker') {
            // Worker goes to identify page to enter email
            this.router.navigate(['/auth/signup/identify']);
          } else {
            // Supervisor (and others) go to regular login for now
            this.router.navigate(['/auth/login']);
          }
        }),
      ),
    { dispatch: false },
  );
}
