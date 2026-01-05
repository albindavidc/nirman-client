import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import * as LoginActions from '../../store/login.actions';
import * as LoginSelectors from '../../store/login.selectors';
import { AuthLogoComponent } from '../../../shared/auth-logo/auth-logo.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    AuthLogoComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);

  hidePassword = signal(true);
  isVendor = signal(false);

  get signupRoute(): string {
    return this.isVendor() ? '/auth/signup/vendor/step1' : '/auth/signup';
  }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  isLoading$ = this.store.select(LoginSelectors.selectIsLoading);
  error$ = this.store.select(LoginSelectors.selectError);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.isVendor.set(params['role'] === 'vendor');
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password, rememberMe } = this.loginForm.value;
      this.store.dispatch(
        LoginActions.login({
          credentials: {
            email: email!,
            password: password!,
            rememberMe: rememberMe ?? false,
          },
        })
      );
    }
  }
}
