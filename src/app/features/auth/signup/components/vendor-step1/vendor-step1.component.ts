import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as SignupActions from '../../store/signup.actions';
import * as SignupSelectors from '../../store/signup.selectors';
import { AuthLogoComponent } from '../../../shared/auth-logo/auth-logo.component';
import { CustomValidators } from '../../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-vendor-step1',
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
  templateUrl: './vendor-step1.component.html',
  styleUrl: './vendor-step1.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(
          '600ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate(
          '400ms 200ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
  ],
})
export class VendorStep1Component implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor() {
    this.loading$ = this.store.select(SignupSelectors.selectLoading);
    this.error$ = this.store.select(SignupSelectors.selectError);
  }

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        firstName: [
          '',
          [Validators.required, CustomValidators.nameValidator(2)],
        ],
        lastName: [
          '',
          [Validators.required, CustomValidators.nameValidator(2)],
        ],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: [
          '',
          [Validators.required, CustomValidators.phoneNumber()],
        ],
        password: [
          '',
          [Validators.required, CustomValidators.passwordStrength()],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: CustomValidators.passwordMatch(
          'password',
          'confirmPassword'
        ),
      }
    );
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.store.dispatch(SignupActions.submitStep1({ data: this.form.value }));
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
