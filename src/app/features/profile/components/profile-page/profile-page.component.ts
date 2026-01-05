import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../models/profile.model';
import { environment } from '../../../../../environments/environment';
import { ImageUploadModalComponent } from '../../../../shared/components/image-upload-modal/image-upload-modal.component';
import * as LoginActions from '../../../auth/login/store/login.actions';
import { CustomValidators } from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatDialogModule,
    TitleCasePipe,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent implements OnInit {
  private readonly store = inject(Store);

  profile: Profile | null = null;
  isLoading = true;
  isSaving = false;
  isChangingPassword = false;
  isUploadingPhoto = false;

  profileForm: FormGroup;
  passwordForm: FormGroup;

  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  readonly apiBaseUrl = environment.apiUrl.replace('/api/v1', '');

  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, CustomValidators.nameValidator(2)]],
      lastName: ['', [Validators.required, CustomValidators.nameValidator(2)]],
      phoneNumber: ['', [CustomValidators.phoneNumber()]],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: [
          '',
          [Validators.required, CustomValidators.passwordStrength()],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: CustomValidators.passwordMatch(
          'newPassword',
          'confirmPassword'
        ),
      }
    );
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber || '',
        });
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load profile', 'Close', {
          duration: 3000,
        });
        this.isLoading = false;
      },
    });
  }

  openUploadModal(): void {
    const dialogRef = this.dialog.open(ImageUploadModalComponent, {
      panelClass: 'upload-modal-dialog',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((file: File | null) => {
      if (file) {
        this.uploadPhoto(file);
      }
    });
  }

  uploadPhoto(file: File): void {
    this.isUploadingPhoto = true;
    this.profileService.uploadProfilePhoto(file).subscribe({
      next: (response) => {
        // Update profile with new photo URL
        this.profileService
          .updateProfile({ profilePhotoUrl: response.url })
          .subscribe({
            next: (updatedProfile) => {
              this.profile = updatedProfile;
              // Dispatch action to update user in store (syncs to sidebar)
              this.store.dispatch(
                LoginActions.updateUserProfile({
                  user: { profilePhotoUrl: updatedProfile.profilePhotoUrl },
                })
              );
              this.snackBar.open('Profile photo updated', 'Close', {
                duration: 3000,
              });
              this.isUploadingPhoto = false;
            },
            error: () => {
              this.snackBar.open('Failed to update profile', 'Close', {
                duration: 3000,
              });
              this.isUploadingPhoto = false;
            },
          });
      },
      error: () => {
        this.snackBar.open('Failed to upload photo', 'Close', {
          duration: 3000,
        });
        this.isUploadingPhoto = false;
      },
    });
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isSaving = true;
    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
        // Dispatch action to update user in store (syncs firstName/lastName to sidebar)
        this.store.dispatch(
          LoginActions.updateUserProfile({
            user: {
              firstName: updatedProfile.firstName,
              lastName: updatedProfile.lastName,
            },
          })
        );
        this.snackBar.open('Profile updated successfully', 'Close', {
          duration: 3000,
        });
        this.isSaving = false;
      },
      error: () => {
        this.snackBar.open('Failed to update profile', 'Close', {
          duration: 3000,
        });
        this.isSaving = false;
      },
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } =
      this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.snackBar.open('Passwords do not match', 'Close', { duration: 3000 });
      return;
    }

    this.isChangingPassword = true;
    this.profileService
      .updatePassword({ currentPassword, newPassword })
      .subscribe({
        next: (res) => {
          this.snackBar.open(
            res.message || 'Password changed successfully',
            'Close',
            { duration: 3000 }
          );
          this.passwordForm.reset();
          this.isChangingPassword = false;
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || 'Failed to change password',
            'Close',
            { duration: 3000 }
          );
          this.isChangingPassword = false;
        },
      });
  }

  getInitials(): string {
    if (!this.profile) return '';
    return `${this.profile.firstName?.charAt(0) || ''}${
      this.profile.lastName?.charAt(0) || ''
    }`.toUpperCase();
  }

  getProfilePhotoUrl(): string | null {
    if (!this.profile?.profilePhotoUrl) return null;
    // If it's a relative URL, prepend the API base
    if (this.profile.profilePhotoUrl.startsWith('/')) {
      return `${this.apiBaseUrl}${this.profile.profilePhotoUrl}`;
    }
    return this.profile.profilePhotoUrl;
  }
}
