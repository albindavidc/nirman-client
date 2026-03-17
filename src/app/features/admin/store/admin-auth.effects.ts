import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AdminAuthService } from '../services/admin-auth.service';
import * as AdminAuthActions from './admin-auth.actions';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AdminAuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly adminAuthService = inject(AdminAuthService);
  private readonly router = inject(Router);

  adminSignup$ = createEffect(
    function (this: AdminAuthEffects) {
      return this.actions$.pipe(
        ofType(AdminAuthActions.AdminAuthActions.signup),
        mergeMap(({ signupData }) =>
          this.adminAuthService.adminSignup(signupData).pipe(
            map((response) =>
              AdminAuthActions.AdminAuthActions.signupSuccess({
                response,
                email: signupData.email,
              }),
            ),
            catchError((error) =>
              of(
                AdminAuthActions.AdminAuthActions.signupFailure({
                  error: error.message,
                }),
              ),
            ),
          ),
        ),
      );
    }.bind(this),
  );

  adminSignupSuccess$ = createEffect(
    function (this: AdminAuthEffects) {
      return this.actions$.pipe(
        ofType(AdminAuthActions.AdminAuthActions.signupSuccess),
        tap(() => {
          this.router.navigate(['/auth/admin/otp']);
        }),
      );
    }.bind(this),
    { dispatch: false },
  );

  verifyOtp$ = createEffect(
    function (this: AdminAuthEffects) {
      return this.actions$.pipe(
        ofType(AdminAuthActions.AdminAuthActions.verifyOTP),
        mergeMap(({ email, otp }) =>
          this.adminAuthService.verifyOtp(email, otp).pipe(
            map((response) =>
              AdminAuthActions.AdminAuthActions.verifyOTPSuccess({ response }),
            ),
            catchError((error) =>
              of(
                AdminAuthActions.AdminAuthActions.verifyOTPFailure({
                  error: error.message,
                }),
              ),
            ),
          ),
        ),
      );
    }.bind(this),
  );

  verifyOtpSuccess$ = createEffect(
    function (this: AdminAuthEffects) {
      return this.actions$.pipe(
        ofType(AdminAuthActions.AdminAuthActions.verifyOTPSuccess),
        tap(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: { role: 'admin' },
          });
        }),
      );
    }.bind(this),
    { dispatch: false },
  );

  adminLogin$ = createEffect(
    function (this: AdminAuthEffects) {
      return this.actions$.pipe(
        ofType(AdminAuthActions.AdminAuthActions.login),
        mergeMap(({ loginData }) =>
          this.adminAuthService.adminLogin(loginData).pipe(
            map((response) =>
              AdminAuthActions.AdminAuthActions.loginSuccess({ response }),
            ),
            catchError((error) =>
              of(
                AdminAuthActions.AdminAuthActions.loginFailure({
                  error: error.message,
                }),
              ),
            ),
          ),
        ),
      );
    }.bind(this),
  );

  adminLoginSuccess$ = createEffect(
    function (this: AdminAuthEffects) {
      return this.actions$.pipe(
        ofType(AdminAuthActions.AdminAuthActions.loginSuccess),
        tap(() => {
          this.router.navigate(['/vendor-management']);
        }),
      );
    }.bind(this),
    { dispatch: false },
  );

  resendAdminOtp$ = createEffect(
    function (this: AdminAuthEffects) {
      return this.actions$.pipe(
        ofType(AdminAuthActions.AdminAuthActions.resendOTP),
        mergeMap(({ email }) =>
          this.adminAuthService.resendOtp(email).pipe(
            map((response) =>
              AdminAuthActions.AdminAuthActions.resendOTPSuccess({ response }),
            ),
            catchError((error) =>
              of(
                AdminAuthActions.AdminAuthActions.resendOTPFailure({
                  error: error.message,
                }),
              ),
            ),
          ),
        ),
      );
    }.bind(this),
  );
}
