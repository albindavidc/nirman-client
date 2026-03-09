import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { adminSignup, savePendingSignupData } from '../../store/admin-auth.actions';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthLogoComponent } from '../../../layouts/auth/auth-logo/auth-logo.component';
import { CustomValidators } from '../../../../shared/validators/custom-validators';
import * as AdminAuthSelectors from '../../store/admin-auth.selectors';

@Component({
  selector: 'app-admin-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AuthLogoComponent,
  ],
  templateUrl: './admin-signup.component.html',
  styleUrls: ['./admin-signup.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(
          '600ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate(
          '400ms 200ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' }),
        ),
      ]),
    ]),
  ],
})
export class AdminSignupComponent {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  signupForm: FormGroup;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  
  loading$ = this.store.select(AdminAuthSelectors.selectAdminAuthLoading);
  error$ = this.store.select(AdminAuthSelectors.selectAdminAuthError);

  constructor() {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, CustomValidators.nameValidator(2)]],
      lastName: ['', [Validators.required, CustomValidators.nameValidator(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, CustomValidators.phoneNumber()]],
      password: ['', [Validators.required, CustomValidators.passwordStrength()]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: CustomValidators.passwordMatch('password', 'confirmPassword') 
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const signupData = this.signupForm.value;
      this.store.dispatch(savePendingSignupData({ signupData }));
      this.store.dispatch(adminSignup({ signupData }));
    } else {
      this.signupForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((v: boolean) => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((v: boolean) => !v);
  }
}
