import { createReducer, on } from '@ngrx/store';
import { SettingsState } from '../models/settings.model';
import * as SettingsActions from './settings.actions';

export const initialState: SettingsState = {
  profile: null,
  loading: false,
  updating: false,
  error: null,
  updateSuccess: false,
  passwordUpdateSuccess: false,
};

export const settingsReducer = createReducer(
  initialState,

  // Load Profile
  on(SettingsActions.loadProfile, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SettingsActions.loadProfileSuccess, (state, { profile }) => ({
    ...state,
    loading: false,
    profile,
  })),
  on(SettingsActions.loadProfileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update Profile
  on(SettingsActions.updateProfile, (state) => ({
    ...state,
    updating: true,
    error: null,
    updateSuccess: false,
  })),
  on(SettingsActions.updateProfileSuccess, (state, { profile }) => ({
    ...state,
    updating: false,
    profile,
    updateSuccess: true,
  })),
  on(SettingsActions.updateProfileFailure, (state, { error }) => ({
    ...state,
    updating: false,
    error,
  })),

  // Update Password
  on(SettingsActions.updatePassword, (state) => ({
    ...state,
    updating: true,
    error: null,
    passwordUpdateSuccess: false,
  })),
  on(SettingsActions.updatePasswordSuccess, (state) => ({
    ...state,
    updating: false,
    passwordUpdateSuccess: true,
  })),
  on(SettingsActions.updatePasswordFailure, (state, { error }) => ({
    ...state,
    updating: false,
    error,
  })),

  // Clear
  on(SettingsActions.clearUpdateSuccess, (state) => ({
    ...state,
    updateSuccess: false,
    passwordUpdateSuccess: false,
    error: null,
  }))
);
