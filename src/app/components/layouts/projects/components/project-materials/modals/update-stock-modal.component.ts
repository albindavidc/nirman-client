import { Component, inject, Inject } from '@angular/core';
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: { material: Material }) {}

  form = this.fb.group({
    type: ['IN', Validators.required],
    quantity: [0, [Validators.required, Validators.min(0.01)]],
    referenceId: [''],
    notes: [''],
  });

  get calculatedStock(): number {
    const current = this.data.material.currentStock;
    const qty = this.form.get('quantity')?.value || 0;
    const type = this.form.get('type')?.value;

    if (type === 'IN') return current + qty;
    if (type === 'OUT') return current - qty;
    return current;
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
