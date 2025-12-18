import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { SettingsService } from '../services/settings.service';
import * as SettingsActions from './settings.actions';

@Injectable()
export class SettingsEffects {
  private readonly actions$ = inject(Actions);
  private readonly settingsService = inject(SettingsService);

  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.loadProfile),
      exhaustMap(() =>
        this.settingsService.getProfile().pipe(
          map((profile) => SettingsActions.loadProfileSuccess({ profile })),
          catchError((error) =>
            of(
              SettingsActions.loadProfileFailure({
                error: error.error?.message || 'Failed to load profile',
              })
            )
          )
        )
      )
    )
  );

  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateProfile),
      exhaustMap(({ data }) =>
        this.settingsService.updateProfile(data).pipe(
          map((profile) => SettingsActions.updateProfileSuccess({ profile })),
          catchError((error) =>
            of(
              SettingsActions.updateProfileFailure({
                error: error.error?.message || 'Failed to update profile',
              })
            )
          )
        )
      )
    )
  );

  updatePassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updatePassword),
      exhaustMap(({ data }) =>
        this.settingsService.updatePassword(data).pipe(
          map(() => SettingsActions.updatePasswordSuccess()),
          catchError((error) =>
            of(
              SettingsActions.updatePasswordFailure({
                error: error.error?.message || 'Failed to update password',
              })
            )
          )
        )
      )
    )
  );
}
