import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, AsyncPipe, NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

// Store
import * as SettingsActions from '../../store/settings.actions';
import * as SettingsSelectors from '../../store/settings.selectors';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    AsyncPipe,
    NgIf,
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
})
export class SettingsPageComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  profile$;
  loading$;
  updating$;
  error$;
  updateSuccess$;
  passwordUpdateSuccess$;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private snackBar: MatSnackBar
  ) {
    this.profile$ = this.store.select(SettingsSelectors.selectProfile);
    this.loading$ = this.store.select(SettingsSelectors.selectLoading);
    this.updating$ = this.store.select(SettingsSelectors.selectUpdating);
    this.error$ = this.store.select(SettingsSelectors.selectError);
    this.updateSuccess$ = this.store.select(
      SettingsSelectors.selectUpdateSuccess
    );
    this.passwordUpdateSuccess$ = this.store.select(
      SettingsSelectors.selectPasswordUpdateSuccess
    );
  }

  ngOnInit(): void {
    this.initForms();
    this.store.dispatch(SettingsActions.loadProfile());

    // Populate form when profile loads
    this.profile$.pipe(takeUntil(this.destroy$)).subscribe((profile) => {
      if (profile) {
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
        });
      }
    });

    // Show success messages
    this.updateSuccess$.pipe(takeUntil(this.destroy$)).subscribe((success) => {
      if (success) {
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
        });
        this.store.dispatch(SettingsActions.clearUpdateSuccess());
      }
    });

    this.passwordUpdateSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe((success) => {
        if (success) {
          this.snackBar.open('Password updated successfully!', 'Close', {
            duration: 3000,
          });
          this.passwordForm.reset();
          this.store.dispatch(SettingsActions.clearUpdateSuccess());
        }
      });

    // Show errors
    this.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      if (error) {
        this.snackBar.open(error, 'Close', { duration: 5000 });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phoneNumber: [''],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  getInitials(): string {
    let initials = '';
    this.profile$.pipe(takeUntil(this.destroy$)).subscribe((profile) => {
      if (profile) {
        initials =
          (profile.firstName?.charAt(0) || '') +
          (profile.lastName?.charAt(0) || '');
      }
    });
    return initials.toUpperCase();
  }

  onUpdateProfile(): void {
    if (this.profileForm.valid) {
      this.store.dispatch(
        SettingsActions.updateProfile({
          data: {
            firstName: this.profileForm.get('firstName')?.value,
            lastName: this.profileForm.get('lastName')?.value,
            phoneNumber: this.profileForm.get('phoneNumber')?.value,
          },
        })
      );
    }
  }

  onUpdatePassword(): void {
    if (this.passwordForm.valid && !this.passwordForm.errors) {
      this.store.dispatch(
        SettingsActions.updatePassword({
          data: {
            currentPassword: this.passwordForm.get('currentPassword')?.value,
            newPassword: this.passwordForm.get('newPassword')?.value,
          },
        })
      );
    }
  }
}
