import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Material } from '../../../../models/material.model';
import { Vendor } from '../../../../../../vendor/models/vendor.models';
import { VendorService } from '../../../../../../vendor/services/vendor.service';
import { CustomValidators } from '../../../../../../../shared/validators/custom-validators';
import { SharedModalComponent } from '../../../../../../../shared/components/shared-modal/shared-modal.component';

@Component({
  selector: 'app-material-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    SharedModalComponent,
  ],
  templateUrl: './material-modal.component.html',
  styleUrl: './material-modal.component.scss',
})
export class MaterialModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<MaterialModalComponent>);
  public data = inject<{ material?: Material }>(MAT_DIALOG_DATA, { optional: true });
  private vendorService = inject(VendorService);

  isEditMode = false;
  vendors: Vendor[] = [];
  
  categories = [
    'Cement',
    'Steel',
    'Aggregates',
    'Bricks',
    'Sand',
    'Wood',
    'Plumbing',
    'Electrical',
    'Finishing',
    'Other',
  ];

  units = ['kg', 'ton', 'bags', 'pieces', 'meters', 'sqm', 'cum', 'liters'];

  statuses = [
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ];

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), CustomValidators.noWhitespace()]],
    code: ['', [Validators.required, Validators.pattern('^[A-Z0-9-]+$')]],
    category: ['', Validators.required],
    unit: ['', Validators.required],
    reorderLevel: [0, [Validators.min(0)]],
    unitPrice: [0, [Validators.min(0)]],
    description: ['', [Validators.maxLength(500), CustomValidators.noWhitespace()]],
    specifications: ['', [Validators.maxLength(500), CustomValidators.noWhitespace()]],
    status: ['in_stock', Validators.required],
    storageLocation: ['', [Validators.maxLength(100)]],
    preferredSupplierId: [null as string | null],
  });

  ngOnInit(): void {
    this.isEditMode = !!this.data?.material;
    
    if (this.isEditMode && this.data?.material) {
      this.form.patchValue(this.data.material);
      this.form.get('code')?.disable();
    }

    this.loadVendors();
  }

  private loadVendors(): void {
    this.vendorService.getVendors({ status: 'approved', limit: 100 }).subscribe({
      next: (response: { vendors: Vendor[] }) => {
        this.vendors = response.vendors;
      },
      error: (err: any) => console.error('Failed to load vendors:', err),
    });
  }

  onSubmit() {
    if (this.form.valid) {
      // Return raw value to include disabled 'code' if necessary (though backend usually handles it)
      const formValue = this.form.getRawValue();
      if (this.isEditMode) {
        // Typically code isn't updated
        delete formValue.code;
      }
      this.dialogRef.close(formValue);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
