import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import * as SignupActions from '../../store/signup.actions';
import * as SignupSelectors from '../../store/signup.selectors';
import { AuthLogoComponent } from '../../../shared/auth-logo/auth-logo.component';
import { CustomValidators } from '../../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-vendor-step2',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    AuthLogoComponent,
  ],
  templateUrl: './vendor-step2.component.html',
  styleUrl: './vendor-step2.component.scss',
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
export class VendorStep2Component implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  form!: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  userId$: Observable<string | null>;

  // Chips configuration
  readonly separatorKeyCodes = [ENTER, COMMA] as const;
  productsServices: string[] = [];

  constructor() {
    this.loading$ = this.store.select(SignupSelectors.selectLoading);
    this.error$ = this.store.select(SignupSelectors.selectError);
    this.userId$ = this.store.select(SignupSelectors.selectUserId);
  }

  ngOnInit(): void {
    // Check if userId exists, redirect to step 1 if not
    this.userId$.pipe(take(1)).subscribe((userId) => {
      if (!userId) {
        this.router.navigate(['/auth/signup/vendor/step1']);
        return;
      }
    });

    this.form = this.fb.group({
      companyName: [
        '',
        [Validators.required, CustomValidators.nameValidator(2)],
      ],
      registrationNumber: ['', [Validators.required]],
      taxNumber: [''],
      yearsInBusiness: [
        '',
        [
          Validators.required,
          Validators.min(0),
          CustomValidators.experienceYears(),
        ],
      ],
      addressStreet: [''],
      addressCity: [''],
      addressState: [''],
      addressZipCode: ['', [CustomValidators.zipCode()]],
    });
  }

  addProduct(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.productsServices.push(value);
    }
    event.chipInput!.clear();
  }

  removeProduct(product: string): void {
    const index = this.productsServices.indexOf(product);
    if (index >= 0) {
      this.productsServices.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.userId$.pipe(take(1)).subscribe((userId) => {
        if (!userId) {
          // Redirect to step 1 if userId is missing
          this.store.dispatch(
            SignupActions.submitStep2Failure({
              error: 'Session expired. Please start the signup process again.',
            })
          );
          this.router.navigate(['/auth/signup/vendor/step1']);
          return;
        }

        const formValue = this.form.value;

        this.store.dispatch(
          SignupActions.submitStep2({
            data: {
              userId,
              companyName: formValue.companyName,
              registrationNumber: formValue.registrationNumber,
              taxNumber: formValue.taxNumber || undefined,
              yearsInBusiness: formValue.yearsInBusiness
                ? parseInt(formValue.yearsInBusiness, 10)
                : undefined,
              addressStreet: formValue.addressStreet || undefined,
              addressCity: formValue.addressCity || undefined,
              addressState: formValue.addressState || undefined,
              addressZipCode: formValue.addressZipCode || undefined,
              productsServices:
                this.productsServices.length > 0
                  ? this.productsServices
                  : undefined,
            },
          })
        );
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
