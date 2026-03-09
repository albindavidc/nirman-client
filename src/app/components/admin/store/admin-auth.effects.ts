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

  adminSignup$ = createEffect(function(this: AdminAuthEffects) {
    return this.actions$.pipe(
      ofType(AdminAuthActions.adminSignup),
      mergeMap(({ signupData }) =>
        this.adminAuthService.adminSignup(signupData).pipe(
          map((response) => AdminAuthActions.adminSignupSuccess({ response, email: signupData.email })),
          catchError((error) => of(AdminAuthActions.adminSignupFailure({ error: error.message })))
        )
      )
    );
  }.bind(this));

  adminSignupSuccess$ = createEffect(
    function(this: AdminAuthEffects) {
      return this.actions$.pipe(
        ofType(AdminAuthActions.adminSignupSuccess),
        tap(() => {
          this.router.navigate(['/auth/admin/otp']);
        })
      );
    }.bind(this),
    { dispatch: false }
  );

  verifyOtp$ = createEffect(function(this: AdminAuthEffects) {
    return this.actions$.pipe(
      ofType(AdminAuthActions.verifyAdminOtp),
      mergeMap(({ email, otp }) =>
        this.adminAuthService.verifyOtp(email, otp).pipe(
          map((response) => AdminAuthActions.verifyAdminOtpSuccess({ response })),
          catchError((error) => of(AdminAuthActions.verifyAdminOtpFailure({ error: error.message })))
        )
      )
    );
  }.bind(this));

  verifyOtpSuccess$ = createEffect(
    function(this: AdminAuthEffects) {
      return this.actions$.pipe(
        ofType(AdminAuthActions.verifyAdminOtpSuccess),
        tap(() => {
          this.router.navigate(['/auth/login'], { queryParams: { role: 'admin' } });
        })
      );
    }.bind(this),
    { dispatch: false }
  );

  adminLogin$ = createEffect(function(this: AdminAuthEffects) {
    return this.actions$.pipe(
      ofType(AdminAuthActions.adminLogin),
      mergeMap(({ loginData }) =>
        this.adminAuthService.adminLogin(loginData).pipe(
          map((response) => AdminAuthActions.adminLoginSuccess({ response })),
          catchError((error) => of(AdminAuthActions.adminLoginFailure({ error: error.message })))
        )
      )
    );
  }.bind(this));

  adminLoginSuccess$ = createEffect(
    function(this: AdminAuthEffects) {
      return this.actions$.pipe(
        ofType(AdminAuthActions.adminLoginSuccess),
        tap(() => {
          this.router.navigate(['/vendor-management']);
        })
      );
    }.bind(this),
    { dispatch: false }
  );

  resendAdminOtp$ = createEffect(function(this: AdminAuthEffects) {
    return this.actions$.pipe(
      ofType(AdminAuthActions.resendAdminOtp),
      mergeMap(({ email }) =>
        this.adminAuthService.resendOtp(email).pipe(
          map(() => AdminAuthActions.resendAdminOtpSuccess()),
          catchError((error) => of(AdminAuthActions.resendAdminOtpFailure({ error: error.message })))
        )
      )
    );
  }.bind(this));
}
