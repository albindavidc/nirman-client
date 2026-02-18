import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthLogoComponent } from '../../../auth-logo/auth-logo.component';
import { CustomValidators } from '../../../../../../shared/validators/custom-validators';
import { SignupService } from '../../services/signup.service';
import { NotificationService } from '../../../../../../core/services/notification.service';
import { catchError, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as SignupSelectors from '../../store/signup.selectors';
import { of } from 'rxjs';

@Component({
  selector: 'app-supervisor-signup',
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
  templateUrl: './supervisor-signup.component.html',
  styleUrl: './supervisor-signup.component.scss',
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
export class SupervisorSignupComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly signupService = inject(SignupService);
  private readonly notification = inject(NotificationService);
  private readonly store = inject(Store);

  form!: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;
  hidePassword = true;
  hideConfirmPassword = true;
  email = '';

  ngOnInit(): void {
    const emailParam = this.route.snapshot.queryParams['email'];
    if (emailParam) {
      this.email = emailParam;
      this.initForm();
    } else {
      // Try to get from store
      this.store
        .select(SignupSelectors.selectEmail)
        .pipe(take(1))
        .subscribe((email) => {
          if (email) {
            this.email = email;
          }
          this.initForm();
        });
    }
  }

  initForm(): void {
    this.form = this.fb.group(
      {
        email: [this.email, [Validators.required, Validators.email]],
        password: [
          '',
          [Validators.required, CustomValidators.passwordStrength()],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: CustomValidators.passwordMatch(
          'password',
          'confirmPassword',
        ),
      },
    );

    if (this.email) {
      this.form.controls['email'].disable();
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      this.error = null;

      const { email, password, confirmPassword } = this.form.getRawValue();

      this.signupService
        .completeSupervisorSignup({
          email: this.email || email,
          password,
          confirmPassword,
        })
        .pipe(
          catchError((err) => {
            this.error =
              err.error?.message ||
              'Failed to complete signup. Please try again.';
            this.loading = false;
            return of(null);
          }),
        )
        .subscribe((response) => {
          if (response) {
            this.loading = false;
            this.notification.success(
              'Account activated successfully. Please login with your new password.',
            );
            this.router.navigate(['/auth/login']);
          }
        });
    } else {
      this.form.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
