import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap, switchMap } from 'rxjs/operators';
import { SignupService } from '../services/signup.service';
import { NotificationService } from '../../../../core/services/notification.service';
import * as SignupActions from './signup.actions';

@Injectable()
export class SignupEffects {
  private readonly actions$ = inject(Actions);
  private readonly signupService = inject(SignupService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  submitStep1$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SignupActions.submitStep1),
      exhaustMap(({ data }) =>
        this.signupService.submitStep1(data).pipe(
          map((response) =>
            SignupActions.submitStep1Success({ response, email: data.email })
          ),
          catchError((error) =>
            of(
              SignupActions.submitStep1Failure({
                error: error.error?.message || 'Failed to submit step 1',
              })
            )
          )
        )
      )
    )
  );

  submitStep1Success$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SignupActions.submitStep1Success),
        tap(() => {
          this.router.navigate(['/auth/signup/vendor/step2']);
        })
      ),
    { dispatch: false }
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
                error: error.error?.message || 'Failed to submit step 2',
              })
            )
          )
        )
      )
    )
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
      })
    )
  );

  // Trigger OTP send after navigating to OTP page
  sendOtpOnStep2Success$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SignupActions.submitStep2Success),
      map(() => {
        // The email will be retrieved from the store in the component
        // and dispatched from there, or we can trigger it here
        return SignupActions.sendOtpSuccess(); // OTP will be sent when component loads
      })
    )
  );

  sendOtp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SignupActions.sendOtp),
      exhaustMap(({ email }) =>
        this.signupService.sendOtp(email).pipe(
          map(() => {
            this.notification.success('Verification code sent to your email');
            return SignupActions.sendOtpSuccess();
          }),
          catchError((error) => {
            this.notification.error(
              error.error?.message || 'Failed to send OTP'
            );
            return of(
              SignupActions.sendOtpFailure({
                error: error.error?.message || 'Failed to send OTP',
              })
            );
          })
        )
      )
    )
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
                error: error.error?.message || 'Invalid OTP',
              })
            )
          )
        )
      )
    )
  );

  verifyOtpSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SignupActions.verifyOtpSuccess),
        tap(() => {
          this.notification.success('Email verified successfully');
          this.router.navigate(['/auth/signup/vendor/success']);
        })
      ),
    { dispatch: false }
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
            this.notification.error(
              error.error?.message || 'Failed to resend OTP'
            );
            return of(
              SignupActions.resendOtpFailure({
                error: error.error?.message || 'Failed to resend OTP',
              })
            );
          })
        )
      )
    )
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
          } else {
            // Labor and Supervisor go to regular login
            this.router.navigate(['/auth/login']);
          }
        })
      ),
    { dispatch: false }
  );
}
