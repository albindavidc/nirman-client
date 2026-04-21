import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import { NotificationService } from '../../../../core/services/notification.service';
import { SessionCleanupService } from '../../../../core/services/session-cleanup.service';
import { getDefaultRouteForUser } from '../../../../core/utils/auth-routing.util';
import { UserProfile } from '../../../../shared/models/profile.model';
import { LoginService } from '../services/login.service';
import * as LoginActions from './login.actions';

@Injectable()
export class LoginEffects {
  private readonly actions$ = inject(Actions);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private readonly sessionCleanup = inject(SessionCleanupService);

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
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LoginActions.loginSuccess),
        tap(({ response }) => {
          this.notification.success('Login successful');
          // Store user in localStorage for persistence on page refresh
          // Note: Token is stored in HTTP-only cookie by the server
          localStorage.setItem('user', JSON.stringify(response.user));

          // Role-based navigation
          const route = this.getRouteByRole(response.user);
          this.router.navigate([route]);
        }),
      ),
    { dispatch: false },
  );

  /**
   * Returns the default route for each user role
   */
  private getRouteByRole(user: UserProfile): string {
    return getDefaultRouteForUser(user);
  }

  // Validate session with backend after hydrating from localStorage
  validateSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.validateSession),
      exhaustMap(() => {
        // Snapshot the user stored locally BEFORE making the /me request
        let localUser: { id?: string; role?: string } | null = null;
        try {
          const raw = localStorage.getItem('user');
          localUser = raw ? JSON.parse(raw) : null;
        } catch {
          localUser = null;
        }

        return this.loginService.getMe().pipe(
          map((backendUser) => {
            // If backend returns null, session is invalid/missing
            if (!backendUser) {
              return LoginActions.validateSessionFailure();
            }

            // ── Critical guard ────────────────────────────────────────────────
            // The backend returns whoever owns the current access_token cookie.
            // If that cookie is stale from a DIFFERENT user (e.g. an old admin
            // session), backendUser.id won't match the id in localStorage.
            // In that case we treat it as a failure so the stale cookie is
            // purged and the user is returned to the home page.
            if (
              localUser?.id &&
              backendUser?.id &&
              localUser.id !== backendUser.id
            ) {
              // Mismatch — reject this session silently
              return LoginActions.validateSessionFailure();
            }

            // Session is valid — write ONLY the fresh backend data to localStorage
            // (do NOT merge with existing local data to avoid carrying stale fields)
            localStorage.setItem('user', JSON.stringify(backendUser));
            return LoginActions.validateSessionSuccess({ user: backendUser });
          }),
          catchError(() => of(LoginActions.validateSessionFailure())),
        );
      }),
    ),
  );

  // On validation failure, clear everything and redirect home
  validateSessionFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LoginActions.validateSessionFailure),
        tap(() => {
          this.sessionCleanup.purgeAll();
          // Don't redirect if already on auth pages
          if (!this.router.url.includes('/auth')) {
            this.router.navigate(['/auth/login']);
          }
        }),
      ),
    { dispatch: false },
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
              }),
            ),
          ),
        ),
      ),
    ),
  );

  forgotPasswordSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LoginActions.forgotPasswordSuccess),
        tap(() => {
          this.notification.success('Reset code sent to your email');
          this.router.navigate(['/auth/login/verify-reset-otp']);
        }),
      ),
    { dispatch: false },
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
              }),
            ),
          ),
        ),
      ),
    ),
  );

  verifyResetOtpSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LoginActions.verifyResetOtpSuccess),
        tap(() => {
          this.router.navigate(['/auth/login/reset-password']);
        }),
      ),
    { dispatch: false },
  );

  resendResetOtp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.resendResetOtp),
      exhaustMap(({ email }) =>
        this.loginService.resendResetOtp(email).pipe(
          map(() => {
            this.notification.success('Code resent successfully');
            return LoginActions.resendResetOtpSuccess();
          }),
          catchError((error) =>
            of(
              LoginActions.resendResetOtpFailure({
                error: error.error?.message || 'Failed to resend code',
              }),
            ),
          ),
        ),
      ),
    ),
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
              }),
            ),
          ),
        ),
      ),
    ),
  );

  resetPasswordSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LoginActions.resetPasswordSuccess),
        tap(() => {
          this.notification.success('Password reset successfully');
          this.router.navigate(['/auth/login']);
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LoginActions.logout),
        tap(() => {
          // Navigate IMMEDIATELY for a snappy, "dynamic" feel
          this.sessionCleanup.purgeAll();
          this.router.navigate(['/']);
          this.notification.success('Logged out successfully');
        }),
        exhaustMap(() =>
          this.loginService.logout().pipe(
            catchError(() => {
              // Silently catch errors as we've already cleared local state
              return of(null);
            }),
          ),
        ),
      ),
    { dispatch: false },
  );
}
