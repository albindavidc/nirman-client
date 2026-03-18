import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { SharedModalComponent } from '../../../../../../shared/components/shared-modal/shared-modal.component';
import { CustomValidators } from '../../../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-add-material-modal',
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
  templateUrl: './add-material-modal.component.html',
  styleUrl: './add-material-modal.component.scss',
})
export class AddMaterialModalComponent {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<AddMaterialModalComponent>);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), CustomValidators.noWhitespace()]],
    code: ['', [Validators.required, Validators.pattern('^[A-Z0-9-]+$')]],
    category: ['', Validators.required],
    unit: ['', Validators.required],
    reorderLevel: [0, [Validators.min(0)]],
    unitPrice: [0, [Validators.min(0)]],
    description: ['', [Validators.maxLength(500), CustomValidators.noWhitespace()]],
    specifications: ['', [Validators.maxLength(500), CustomValidators.noWhitespace()]],
  });

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
