import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Material } from '../../../models/material.model';
import { SharedModalComponent } from '../../../../../../shared/components/shared-modal/shared-modal.component';
import { CustomValidators } from '../../../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-update-stock-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    SharedModalComponent,
  ],
  templateUrl: './update-stock-modal.component.html',
  styleUrl: './update-stock-modal.component.scss',
})
export class UpdateStockModalComponent {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<UpdateStockModalComponent>);

  public data = inject<{ material: Material }>(MAT_DIALOG_DATA);

  // constructor() {} // Removed as it's empty now

  form = this.fb.group({
    type: ['IN', Validators.required],
    quantity: [0, [Validators.required, Validators.min(0.01)]],
    referenceId: [''],
    notes: ['', [Validators.maxLength(500), CustomValidators.noWhitespace()]],
  });

  get calculatedStock(): number {
    const current = this.data.material.currentStock;
    const qty = this.form.get('quantity')?.value || 0;
    const type = this.form.get('type')?.value;

    if (type === 'IN') return current + qty;
    if (type === 'OUT') return current - qty;
    return current;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value);
  }
}
