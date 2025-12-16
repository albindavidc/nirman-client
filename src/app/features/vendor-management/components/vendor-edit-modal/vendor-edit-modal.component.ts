import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';

import { Vendor, VendorStatus } from '../../models/vendor.models';
import * as VendorActions from '../../store/vendor.actions';
import * as VendorSelectors from '../../store/vendor.selectors';

@Component({
  selector: 'app-vendor-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './vendor-edit-modal.component.html',
  styleUrl: './vendor-edit-modal.component.scss',
})
export class VendorEditModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly dialogRef = inject(MatDialogRef<VendorEditModalComponent>);
  private readonly data: { vendor: Vendor } = inject(MAT_DIALOG_DATA);

  isUpdating$ = this.store.select(VendorSelectors.selectIsUpdating);

  statusOptions: { value: VendorStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Active' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'blacklisted', label: 'Blacklisted' },
  ];

  isAddMode = false;

  editForm = this.fb.group({
    // User Details (Only for Add Mode)
    firstName: [''],
    lastName: [''],
    email: ['', [Validators.email]],

    // Vendor Details
    companyName: ['', [Validators.required]],
    registrationNumber: ['', [Validators.required]],
    taxNumber: [''],
    yearsInBusiness: [0, [Validators.min(0)]],
    addressStreet: ['', [Validators.required]],
    addressCity: [''],
    addressState: [''],
    addressZipCode: [''],
    websiteUrl: [''],
    contactPhone: ['', [Validators.required]],
    contactEmail: ['', [Validators.required, Validators.email]],
    vendorStatus: ['approved' as VendorStatus],
    productsServices: [''],
  });

  ngOnInit(): void {
    if (this.data?.vendor) {
      this.isAddMode = false;
      const vendor = this.data.vendor;
      this.editForm.patchValue({
        companyName: vendor.companyName,
        registrationNumber: vendor.registrationNumber,
        taxNumber: vendor.taxNumber || '',
        yearsInBusiness: vendor.yearsInBusiness || 0,
        addressStreet: vendor.addressStreet || '',
        addressCity: vendor.addressCity || '',
        addressState: vendor.addressState || '',
        addressZipCode: vendor.addressZipCode || '',
        websiteUrl: vendor.websiteUrl || '',
        contactPhone: vendor.contactPhone || '',
        contactEmail: vendor.contactEmail || vendor.user?.email || '',
        vendorStatus: vendor.vendorStatus,
        productsServices: (vendor.productsServices || []).join(', '),
      });
      // Disable user fields in edit mode or remove validators
    } else {
      this.isAddMode = true;
      // Add validators for user fields
      this.editForm.get('firstName')?.addValidators(Validators.required);
      this.editForm.get('lastName')?.addValidators(Validators.required);
      this.editForm
        .get('email')
        ?.addValidators([Validators.required, Validators.email]);
      this.editForm.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;
      const productsServices =
        typeof formValue.productsServices === 'string'
          ? formValue.productsServices
              .split(',')
              .map((s: string) => s.trim())
              .filter((s: string) => s)
          : [];

      if (this.isAddMode) {
        // Create Logic
        const createData = {
          email: formValue.email,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          phone: formValue.contactPhone, // Reuse contact phone for user phone
          companyName: formValue.companyName,
          registrationNumber: formValue.registrationNumber,
          taxNumber: formValue.taxNumber,
          yearsInBusiness: formValue.yearsInBusiness,
          addressStreet: formValue.addressStreet,
          addressCity: formValue.addressCity,
          addressState: formValue.addressState,
          addressZipCode: formValue.addressZipCode,
          productsServices: productsServices,
          websiteUrl: formValue.websiteUrl,
          contactEmail: formValue.contactEmail,
          contactPhone: formValue.contactPhone,
          vendorStatus: formValue.vendorStatus,
        };
        this.store.dispatch(VendorActions.createVendor({ data: createData }));
      } else if (this.data?.vendor) {
        // Update Logic
        this.store.dispatch(
          VendorActions.updateVendor({
            id: this.data.vendor.id,
            data: {
              companyName: formValue.companyName!,
              registrationNumber: formValue.registrationNumber!,
              taxNumber: formValue.taxNumber!,
              yearsInBusiness: formValue.yearsInBusiness!,
              addressStreet: formValue.addressStreet!,
              addressCity: formValue.addressCity!,
              addressState: formValue.addressState!,
              addressZipCode: formValue.addressZipCode!,
              websiteUrl: formValue.websiteUrl!,
              productsServices: productsServices,
              contactPhone: formValue.contactPhone!,
              contactEmail: formValue.contactEmail!,
              vendorStatus: formValue.vendorStatus as VendorStatus,
            },
          })
        );
      }
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
