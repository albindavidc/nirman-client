import { Component, inject, OnInit } from '@angular/core';
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
import { ProjectPhaseService } from '../../../../services/project-phase.service';
import { SharedModalComponent } from '../../../../../../../shared/components/shared-modal/shared-modal.component';
import { CustomValidators } from '../../../../../../../shared/validators/custom-validators';

export interface ReviewPhaseDialogData {
  phaseId: string;
  phaseName: string;
  mode: 'approve' | 'reject';
}

@Component({
  selector: 'app-review-phase-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    SharedModalComponent,
  ],
  templateUrl: './review-phase-modal.component.html',
  styleUrl: './review-phase-modal.component.scss',
})
export class ReviewPhaseModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef =
    inject<MatDialogRef<ReviewPhaseModalComponent>>(MatDialogRef);
  data = inject<ReviewPhaseDialogData>(MAT_DIALOG_DATA);
  private readonly phaseService = inject(ProjectPhaseService);

  form!: FormGroup;
  isSubmitting = false;

  get isApproveMode(): boolean {
    return this.data.mode === 'approve';
  }

  get isRejectMode(): boolean {
    return this.data.mode === 'reject';
  }

  ngOnInit() {
    this.form = this.fb.group({
      comments: [
        '',
        this.isRejectMode
          ? [
              Validators.required,
              Validators.minLength(10),
              Validators.maxLength(1000),
              CustomValidators.noWhitespace(),
            ]
          : [Validators.maxLength(1000), CustomValidators.noWhitespace()],
      ],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const request$ = this.isApproveMode
      ? this.phaseService.approvePhase(this.data.phaseId, {
          approvalStatus: 'approved',
          comments: this.form.value.comments,
        })
      : this.phaseService.rejectPhase(this.data.phaseId, {
          approvalStatus: 'rejected',
          comments: this.form.value.comments,
        });

    request$.subscribe({
      next: () => {
        // Return comments so the parent component can know it succeeded, avoid redundant API call
        this.dialogRef.close({
          success: true,
          comments: this.form.value.comments,
        });
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
