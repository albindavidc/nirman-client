import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SettingsState } from '../models/settings.model';

export const selectSettingsState =
  createFeatureSelector<SettingsState>('settings');

export const selectProfile = createSelector(
  selectSettingsState,
  (state) => state.profile
);

export const selectLoading = createSelector(
  selectSettingsState,
  (state) => state.loading
);

export const selectUpdating = createSelector(
  selectSettingsState,
  (state) => state.updating
);

export const selectError = createSelector(
  selectSettingsState,
  (state) => state.error
);

export const selectUpdateSuccess = createSelector(
  selectSettingsState,
  (state) => state.updateSuccess
);

export const selectPasswordUpdateSuccess = createSelector(
  selectSettingsState,
  (state) => state.passwordUpdateSuccess
);
