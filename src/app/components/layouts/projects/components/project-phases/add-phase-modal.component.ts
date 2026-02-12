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
    const data = this.data;

    this.phaseForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      plannedStartDate: [null],
      plannedEndDate: [null],
      sequence: [data.nextSequence || 1, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.phaseForm.valid) {
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
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
