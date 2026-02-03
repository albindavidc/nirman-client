import { Component, inject } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { SharedModalComponent } from '../../../../shared/components/shared-modal/shared-modal.component';

interface ApproveDialogData {
  phaseId: string;
  phaseName: string;
}

@Component({
  selector: 'app-approve-phase-modal',
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
  templateUrl: './approve-phase-modal.component.html',
  styleUrl: './approve-phase-modal.component.scss',
})
export class ApprovePhaseModalComponent {
  private fb = inject(FormBuilder);
  private dialogRef =
    inject<MatDialogRef<ApprovePhaseModalComponent>>(MatDialogRef);
  data = inject<ApproveDialogData>(MAT_DIALOG_DATA);

  private readonly phaseService = inject(ProjectPhaseService);

  form: FormGroup;
  isSubmitting = false;

  constructor() {
    this.form = this.fb.group({
      comments: [''],
    });
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.phaseService
      .approvePhase(this.data.phaseId, {
        approvalStatus: 'approved',
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
