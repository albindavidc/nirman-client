import { Component, inject, OnInit } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ProjectPhase } from '../../models/project.models';
import { SharedModalComponent } from '../../../../../shared/components/shared-modal/shared-modal.component';

@Component({
  selector: 'app-update-phase-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    SharedModalComponent,
  ],
  templateUrl: './update-phase-modal.component.html',
  styleUrls: ['./update-phase-modal.component.scss'],
})
export class UpdatePhaseModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef =
    inject<MatDialogRef<UpdatePhaseModalComponent>>(MatDialogRef);
  public data = inject<{ phase: ProjectPhase }>(MAT_DIALOG_DATA);

  phaseForm!: FormGroup;

  ngOnInit() {
    const phase = this.data.phase;
    this.phaseForm = this.fb.group({
      name: [
        phase.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: [phase.description || '', [Validators.maxLength(500)]],
      plannedStartDate: [phase.plannedStartDate],
      plannedEndDate: [phase.plannedEndDate],
      actualStartDate: [phase.actualStartDate],
      actualEndDate: [phase.actualEndDate],
      status: [phase.status, Validators.required],
      sequence: [phase.sequence, [Validators.required, Validators.min(1)]],
      progress: [phase.progress, [Validators.min(0), Validators.max(100)]],
    });
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
      actualStartDate: formValue.actualStartDate
        ? new Date(formValue.actualStartDate).toISOString()
        : null,
      actualEndDate: formValue.actualEndDate
        ? new Date(formValue.actualEndDate).toISOString()
        : null,
    };
    this.dialogRef.close(payload);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
