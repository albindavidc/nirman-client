import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { adminLogin } from '../../store/admin-auth.actions';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthLogoComponent } from '../../../layouts/auth/auth-logo/auth-logo.component';
import * as AdminAuthSelectors from '../../store/admin-auth.selectors';

@Component({
  selector: 'app-admin-login',
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
    MatCheckboxModule,
    AuthLogoComponent,
  ],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
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
  ],
})
export class AdminLoginComponent {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  loginForm: FormGroup;
  hidePassword = signal(true);
  
  loading$ = this.store.select(AdminAuthSelectors.selectAdminAuthLoading);
  error$ = this.store.select(AdminAuthSelectors.selectAdminAuthError);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.store.dispatch(adminLogin({ loginData: this.loginForm.value }));
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(v => !v);
  }
}
