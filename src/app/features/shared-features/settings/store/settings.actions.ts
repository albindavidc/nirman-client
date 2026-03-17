import { createAction, props } from '@ngrx/store';
import {
  UserProfile,
  UpdateProfileRequest,
  UpdatePasswordRequest,
} from '../models/settings.model';

// Load Profile
export const loadProfile = createAction('[Settings] Load Profile');
export const loadProfileSuccess = createAction(
  '[Settings] Load Profile Success',
  props<{ profile: UserProfile }>()
);
export const loadProfileFailure = createAction(
  '[Settings] Load Profile Failure',
  props<{ error: string }>()
);

// Update Profile
export const updateProfile = createAction(
  '[Settings] Update Profile',
  props<{ data: UpdateProfileRequest }>()
);
export const updateProfileSuccess = createAction(
  '[Settings] Update Profile Success',
  props<{ profile: UserProfile }>()
);
export const updateProfileFailure = createAction(
  '[Settings] Update Profile Failure',
  props<{ error: string }>()
);

// Update Password
export const updatePassword = createAction(
  '[Settings] Update Password',
  props<{ data: UpdatePasswordRequest }>()
);
export const updatePasswordSuccess = createAction(
  '[Settings] Update Password Success'
);
export const updatePasswordFailure = createAction(
  '[Settings] Update Password Failure',
  props<{ error: string }>()
);

// Clear Messages
export const clearUpdateSuccess = createAction(
  '[Settings] Clear Update Success'
);
