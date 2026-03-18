import { Component, inject } from '@angular/core';

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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProjectPhaseService } from '../../services/project-phase.service';
import { SharedModalComponent } from '../../../../../shared/components/shared-modal/shared-modal.component';
import { CustomValidators } from '../../../../../shared/validators/custom-validators';

interface RejectDialogData {
  phaseId: string;
  phaseName: string;
}

@Component({
  selector: 'app-reject-phase-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonModule,
    MatIconModule,
    SharedModalComponent,
  ],
  templateUrl: './reject-phase-modal.component.html',
  styleUrl: './reject-phase-modal.component.scss',
})
export class RejectPhaseModalComponent {
  private fb = inject(FormBuilder);
  private dialogRef =
    inject<MatDialogRef<RejectPhaseModalComponent>>(MatDialogRef);
  data = inject<RejectDialogData>(MAT_DIALOG_DATA);

  private readonly phaseService = inject(ProjectPhaseService);

  form: FormGroup;
  isSubmitting = false;

  constructor() {
    this.form = this.fb.group({
      comments: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1000),
          CustomValidators.noWhitespace(),
        ],
      ],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.phaseService
      .rejectPhase(this.data.phaseId, {
        approvalStatus: 'rejected',
        comments: this.form.value.comments,
      })
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: () => {
          this.isSubmitting = false;
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
