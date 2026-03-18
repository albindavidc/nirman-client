import { Component, inject } from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { SharedModalComponent } from '../../../../../shared/components/shared-modal/shared-modal.component';
import { CustomValidators } from '../../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-add-phase-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatNativeDateModule,
    MatButtonModule,
    SharedModalComponent,
  ],
  templateUrl: './add-phase-modal.component.html',
  styleUrl: './add-phase-modal.component.scss',
})
export class AddPhaseModalComponent {
  private fb = inject(FormBuilder);
  private dialogRef =
    inject<MatDialogRef<AddPhaseModalComponent>>(MatDialogRef);
  data = inject<{
    nextSequence: number;
  }>(MAT_DIALOG_DATA);

  phaseForm: FormGroup;

  constructor() {
    this.phaseForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          CustomValidators.noWhitespace(),
        ],
      ],
      description: ['', [Validators.maxLength(500), CustomValidators.noWhitespace()]],
      plannedStartDate: [null],
      plannedEndDate: [null],
      sequence: [null, [Validators.required, Validators.min(1)]],
    }, { validators: CustomValidators.dateRange('plannedStartDate', 'plannedEndDate') });
  }

  onSubmit(): void {
    if (this.phaseForm.invalid) {
      this.phaseForm.markAllAsTouched();
      return;
    }
    const formValue = this.phaseForm.value;
    const payload = {
      ...formValue,
      plannedStartDate: formValue.plannedStartDate
        ? new Date(formValue.plannedStartDate).toISOString()
        : null,
      plannedEndDate: formValue.plannedEndDate
        ? new Date(formValue.plannedEndDate).toISOString()
        : null,
    };
    this.dialogRef.close(payload);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
