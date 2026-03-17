import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from '../../../../../shared/validators/custom-validators';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import * as LoginActions from '../../store/login.actions';
import * as LoginSelectors from '../../store/login.selectors';
import { AuthLogoComponent } from '../../../auth-logo/auth-logo.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AuthLogoComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  resetPasswordForm = this.fb.group(
    {
      newPassword: [
        '',
        [Validators.required, CustomValidators.passwordStrength()],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: CustomValidators.passwordMatch(
        'newPassword',
        'confirmPassword',
      ),
    },
  );

  email$ = this.store.select(LoginSelectors.selectForgotPasswordEmail);
  resetToken$ = this.store.select(LoginSelectors.selectResetToken);
  isLoading$ = this.store.select(LoginSelectors.selectResetPasswordLoading);
  error$ = this.store.select(LoginSelectors.selectError);

  togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      const { newPassword } = this.resetPasswordForm.value;

      let email: string | null = null;
      let resetToken: string | null = null;

      this.email$.subscribe((e) => (email = e)).unsubscribe();
      this.resetToken$.subscribe((t) => (resetToken = t)).unsubscribe();

      if (email && resetToken && newPassword) {
        this.store.dispatch(
          LoginActions.resetPassword({
            email,
            resetToken,
            newPassword,
          }),
        );
      }
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }
}
