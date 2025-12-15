import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { SignupService } from '../services/signup.service';
import * as SignupActions from './signup.actions';

@Injectable()
export class SignupEffects {
  private readonly actions$ = inject(Actions);
  private readonly signupService = inject(SignupService);
  private readonly router = inject(Router);

  submitStep1$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SignupActions.submitStep1),
      exhaustMap(({ data }) =>
        this.signupService.submitStep1(data).pipe(
          map((response) => SignupActions.submitStep1Success({ response })),
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

  submitStep2Success$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SignupActions.submitStep2Success),
        tap(() => {
          // Navigate to success page or login
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );

  selectAccountType$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SignupActions.selectAccountType),
        tap(({ accountType }) => {
          if (accountType === 'vendor') {
            this.router.navigate(['/auth/signup/vendor/step1']);
          }
          // Add other account type routes as needed
        })
      ),
    { dispatch: false }
  );
}
