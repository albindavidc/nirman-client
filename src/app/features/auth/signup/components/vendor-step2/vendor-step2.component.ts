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
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as SignupActions from '../../store/signup.actions';
import * as SignupSelectors from '../../store/signup.selectors';

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

  form!: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  userId$: Observable<string | null>;

  businessTypes = [
    { value: 'general_contractor', label: 'General Contractor' },
    { value: 'subcontractor', label: 'Subcontractor' },
    { value: 'supplier', label: 'Material Supplier' },
    { value: 'equipment_rental', label: 'Equipment Rental' },
    { value: 'consulting', label: 'Consulting Services' },
    { value: 'other', label: 'Other' },
  ];

  constructor() {
    this.loading$ = this.store.select(SignupSelectors.selectLoading);
    this.error$ = this.store.select(SignupSelectors.selectError);
    this.userId$ = this.store.select(SignupSelectors.selectUserId);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      registrationNumber: ['', [Validators.required]],
      taxNumber: [''],
      businessType: ['', [Validators.required]],
      yearsInBusiness: ['', [Validators.required, Validators.min(0)]],
      addressStreet: [''],
      addressCity: [''],
      addressState: [''],
      addressZipCode: [''],
      productsServices: [''],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.userId$
        .subscribe((userId) => {
          if (userId) {
            const formValue = this.form.value;
            const productsServices = formValue.productsServices
              ? formValue.productsServices
                  .split(',')
                  .map((s: string) => s.trim())
                  .filter((s: string) => s)
              : [];

            this.store.dispatch(
              SignupActions.submitStep2({
                data: {
                  userId,
                  companyName: formValue.companyName,
                  registrationNumber: formValue.registrationNumber,
                  taxNumber: formValue.taxNumber || undefined,
                  businessType: formValue.businessType,
                  yearsInBusiness: formValue.yearsInBusiness
                    ? parseInt(formValue.yearsInBusiness, 10)
                    : undefined,
                  addressStreet: formValue.addressStreet || undefined,
                  addressCity: formValue.addressCity || undefined,
                  addressState: formValue.addressState || undefined,
                  addressZipCode: formValue.addressZipCode || undefined,
                  productsServices:
                    productsServices.length > 0 ? productsServices : undefined,
                },
              })
            );
          }
        })
        .unsubscribe();
    } else {
      this.form.markAllAsTouched();
    }
  }
}
