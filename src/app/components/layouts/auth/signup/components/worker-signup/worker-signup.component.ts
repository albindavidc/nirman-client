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
import { catchError, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as SignupSelectors from '../../store/signup.selectors';
import { of } from 'rxjs';

@Component({
  selector: 'app-worker-signup',
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
  templateUrl: './worker-signup.component.html',
  styleUrl: './worker-signup.component.scss',
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
export class WorkerSignupComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly signupService = inject(SignupService);
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
        email: [{ value: this.email, disabled: true }, [Validators.required]],
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

    if (!this.email) {
      this.error = 'No email provided. Please check your invitation link.';
      this.form.disable();
    }
  }

  onSubmit(): void {
    if (this.form.valid && this.email) {
      this.loading = true;
      this.error = null;

      const { password, confirmPassword } = this.form.getRawValue();

      this.signupService
        .completeWorkerSignup({
          email: this.email,
          password,
          confirmPassword,
        })
        .pipe(
          catchError((err) => {
            this.error =
              err.error?.message ||
              'Failed to complete signup. Please try again.';
            return of(null);
          }),
        )
        .subscribe((response) => {
          this.loading = false;
          if (response) {
            this.success = true;
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
