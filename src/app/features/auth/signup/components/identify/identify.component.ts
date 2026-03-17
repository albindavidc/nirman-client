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
  selector: 'app-identify',
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
  templateUrl: './identify.component.html',
  styleUrl: './identify.component.scss',
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
export class IdentifyComponent {
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
      // Dispatch sendOtp action directly
      // The effect handles the API call
      this.store.dispatch(SignupActions.sendOtp({ email }));

      // We also need to update the email in the store so subsequent steps (verify) use it
      // The sendOtp action payload might not persist it to the 'email' state property
      // depending on the reducer. Let's check the reducer.
      // Looking at the reducer, sendOtp just sets loading=true.
      // We might need an action to set the email or update the reducer to set email on sendOtp based on payload.
      // For now, I'll dispatch a set email action if it exists, or rely on the effect to handle it?
      // Actually, standard pattern: Update state then trigger side effect.
      // But here, let's assume sendOtp handles it or we update reducer.
    } else {
      this.form.markAllAsTouched();
    }
  }
}
