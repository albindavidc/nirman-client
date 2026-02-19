import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Material } from '../../../models/material.model';

@Component({
  selector: 'app-edit-material-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './edit-material-modal.component.html',
  styleUrls: ['./edit-material-modal.component.scss'],
})
export class EditMaterialModalComponent implements OnInit {
  materialForm: FormGroup;

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

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditMaterialModalComponent>);
  public data = inject<{ material: Material }>(MAT_DIALOG_DATA);

  constructor() {
    this.materialForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      code: [{ value: '', disabled: true }, Validators.required], // Code is usually immutable or requires special handling
      category: ['', Validators.required],
      description: ['', Validators.maxLength(500)],
      specifications: ['', Validators.maxLength(500)],
      unit: ['', Validators.required],
      unitPrice: [0, [Validators.min(0)]],
      reorderLevel: [0, [Validators.min(0)]],
      status: ['in_stock', Validators.required],
      storageLocation: [''],
      preferredSupplierId: [''],
    });
  }

  ngOnInit(): void {
    if (this.data.material) {
      this.materialForm.patchValue({
        name: this.data.material.name,
        code: this.data.material.code,
        category: this.data.material.category,
        description: this.data.material.description,
        specifications: this.data.material.specifications,
        unit: this.data.material.unit,
        unitPrice: this.data.material.unitPrice,
        reorderLevel: this.data.material.reorderLevel,
        status: this.data.material.status,
        storageLocation: this.data.material.storageLocation,
        preferredSupplierId: this.data.material.preferredSupplierId,
      });
    }
  }

  onSubmit() {
    if (this.materialForm.valid) {
      // Include disabled fields if needed, or just the changed values
      const formValue = this.materialForm.getRawValue();
      // Remove code since it's immutable for now
      delete formValue.code;
      this.dialogRef.close(formValue);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
