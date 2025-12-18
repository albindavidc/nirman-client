import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { LoginService } from '../services/login.service';
import * as LoginActions from './login.actions';

@Injectable()
export class LoginEffects {
  private readonly actions$ = inject(Actions);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.login),
      exhaustMap(({ credentials }) =>
        this.loginService.login(credentials).pipe(
          map((response) => LoginActions.loginSuccess({ response })),
          catchError((error) =>
            of(
              LoginActions.loginFailure({
                error: error.error?.message || 'Invalid email or password',
              })
            )
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LoginActions.loginSuccess),
        tap(({ response }) => {
          // Store user in localStorage for persistence on page refresh
          // Note: Token is stored in HTTP-only cookie by the server
          localStorage.setItem('user', JSON.stringify(response.user));

          // Role-based navigation
          const route = this.getRouteByRole(response.user.role);
          this.router.navigate([route]);
        })
      ),
    { dispatch: false }
  );

  /**
   * Returns the default route for each user role
   */
  private getRouteByRole(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return '/vendor-management';
      case 'supervisor':
        return '/dashboard/supervisor';
      case 'vendor':
        return '/dashboard/vendor';
      case 'worker':
        return '/dashboard/worker';
      default:
        return '/dashboard';
    }
  }

  // Validate session with backend after hydrating from localStorage
  validateSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.validateSession),
      exhaustMap(() =>
        this.loginService.getMe().pipe(
          map((user) => LoginActions.validateSessionSuccess({ user })),
          catchError(() => of(LoginActions.validateSessionFailure()))
        )
      )
    )
  );

  // On validation failure, clear user and redirect to login
  validateSessionFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LoginActions.validateSessionFailure),
        tap(() => {
          localStorage.removeItem('user');
          // Don't redirect if already on auth pages
          if (!this.router.url.includes('/auth')) {
            this.router.navigate(['/auth/login']);
          }
        })
      ),
    { dispatch: false }
  );

  forgotPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.forgotPassword),
      exhaustMap(({ email }) =>
        this.loginService.forgotPassword(email).pipe(
          map(() => LoginActions.forgotPasswordSuccess({ email })),
          catchError((error) =>
            of(
              LoginActions.forgotPasswordFailure({
                error: error.error?.message || 'Failed to send reset code',
              })
            )
          )
        )
      )
    )
  );

  forgotPasswordSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LoginActions.forgotPasswordSuccess),
        tap(() => {
          this.router.navigate(['/auth/login/verify-reset-otp']);
        })
      ),
    { dispatch: false }
  );

  verifyResetOtp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.verifyResetOtp),
      exhaustMap(({ email, otp }) =>
        this.loginService.verifyResetOtp(email, otp).pipe(
          map((response) => LoginActions.verifyResetOtpSuccess({ response })),
          catchError((error) =>
            of(
              LoginActions.verifyResetOtpFailure({
                error: error.error?.message || 'Invalid OTP',
              })
            )
          )
        )
      )
    )
  );

  verifyResetOtpSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LoginActions.verifyResetOtpSuccess),
        tap(() => {
          this.router.navigate(['/auth/login/reset-password']);
        })
      ),
    { dispatch: false }
  );

  resendResetOtp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.resendResetOtp),
      exhaustMap(({ email }) =>
        this.loginService.resendResetOtp(email).pipe(
          map(() => LoginActions.resendResetOtpSuccess()),
          catchError((error) =>
            of(
              LoginActions.resendResetOtpFailure({
                error: error.error?.message || 'Failed to resend code',
              })
            )
          )
        )
      )
    )
  );

  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.resetPassword),
      exhaustMap(({ email, resetToken, newPassword }) =>
        this.loginService.resetPassword(email, resetToken, newPassword).pipe(
          map(() => LoginActions.resetPasswordSuccess()),
          catchError((error) =>
            of(
              LoginActions.resetPasswordFailure({
                error: error.error?.message || 'Failed to reset password',
              })
            )
          )
        )
      )
    )
  );

  resetPasswordSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LoginActions.resetPasswordSuccess),
        tap(() => {
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LoginActions.logout),
        exhaustMap(() =>
          this.loginService.logout().pipe(
            tap(() => {
              localStorage.removeItem('user');
              this.router.navigate(['/auth/login']);
            }),
            catchError(() => {
              // Even if API fails, clear local data
              localStorage.removeItem('user');
              this.router.navigate(['/auth/login']);
              return of(null);
            })
          )
        )
      ),
    { dispatch: false }
  );
}
