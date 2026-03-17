import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { trigger, transition, style, animate } from '@angular/animations';
import { Observable } from 'rxjs';

import * as SignupActions from '../../store/signup.actions';
import * as SignupSelectors from '../../store/signup.selectors';

@Component({
  selector: 'app-worker-step1',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './worker-step1.component.html',
  styleUrl: './worker-step1.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
})
export class WorkerStep1Component {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  loading$: Observable<boolean> = this.store.select(
    SignupSelectors.selectLoading,
  );
  error$: Observable<string | null> = this.store.select(
    SignupSelectors.selectError,
  );

  onSubmit(): void {
    if (this.form.valid) {
      const email = this.form.value.email;
      this.store.dispatch(
        SignupActions.selectAccountType({
          accountType: 'worker',
          redirect: false,
        }),
      );
      this.store.dispatch(
        SignupActions.sendOtp({ email, role: 'worker', isSignup: true }),
      );
    } else {
      this.form.markAllAsTouched();
    }
  }
}
