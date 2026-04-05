import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ProjectPhase } from '../../../models/project.models';
import { WorkerGroupService } from '../../../../workers/services/worker-group.service';
import { WorkerGroup } from '../../../../workers/models/worker-group.model';
import { SharedModalComponent } from '../../../../../../shared/components/shared-modal/shared-modal.component';
import { CustomValidators } from '../../../../../../shared/validators/custom-validators';

/** Discriminated union data contract for the unified phase modal. */
export type PhaseModalData =
  | { mode: 'create'; nextSequence: number }
  | { mode: 'edit'; phase: ProjectPhase };

/** All phase statuses available in the edit form. */
export const PHASE_STATUSES = [
  'Not Started',
  'In Progress',
  'Completed',
  'On Hold',
] as const;

@Component({
  selector: 'app-phase-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    SharedModalComponent,
  ],
  templateUrl: './phase-modal.component.html',
  styleUrls: ['./phase-modal.component.scss'],
})
export class PhaseModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PhaseModalComponent>);
  public readonly data = inject<PhaseModalData>(MAT_DIALOG_DATA);
  private readonly workerGroupService = inject(WorkerGroupService);

  phaseForm!: FormGroup;
  isSubmitting = false;
  workerGroups: WorkerGroup[] = [];

  readonly phaseStatuses = PHASE_STATUSES;

  /** Convenience getter to avoid repeated ternary checks in the template. */
  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  get modalTitle(): string {
    return this.isEditMode
      ? `Edit Phase: ${(this.data as { mode: 'edit'; phase: ProjectPhase }).phase.name}`
      : 'Add New Phase';
  }

  get submitLabel(): string {
    return this.isEditMode ? 'Save Changes' : 'Add Phase';
  }

  ngOnInit(): void {
    this.initForm();
    this.loadWorkerGroups();
  }

  private loadWorkerGroups(): void {
    this.workerGroupService.getGroups().subscribe({
      next: (groups) => (this.workerGroups = groups),
      error: (err) => console.error('Error loading worker groups', err),
    });
  }

  private initForm(): void {
    if (this.isEditMode) {
      const phase = (this.data as { mode: 'edit'; phase: ProjectPhase }).phase;
      this.phaseForm = this.fb.group(
        {
          name: [
            phase.name,
            [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(100),
              CustomValidators.noWhitespace(),
            ],
          ],
          description: [
            phase.description ?? '',
            [Validators.maxLength(500), CustomValidators.noWhitespace()],
          ],
          plannedStartDate: [phase.plannedStartDate ?? null],
          plannedEndDate: [phase.plannedEndDate ?? null],
          actualStartDate: [phase.actualStartDate ?? null],
          actualEndDate: [phase.actualEndDate ?? null],
          status: [phase.status, Validators.required],
          sequence: [phase.sequence, [Validators.required, Validators.min(1)]],
          progress: [
            phase.progress,
            [Validators.min(0), Validators.max(100)],
          ],
          workerGroupIds: [phase.workerGroups?.map((wg: any) => wg.id) || []],
        },
        {
          validators: [
            CustomValidators.dateRange('plannedStartDate', 'plannedEndDate'),
            CustomValidators.dateRange('actualStartDate', 'actualEndDate'),
          ],
        },
      );
    } else {
      const { nextSequence } = this.data as { mode: 'create'; nextSequence: number };
      this.phaseForm = this.fb.group(
        {
          name: [
            '',
            [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(100),
              CustomValidators.noWhitespace(),
            ],
          ],
          description: [
            '',
            [Validators.maxLength(500), CustomValidators.noWhitespace()],
          ],
          plannedStartDate: [null],
          plannedEndDate: [null],
          sequence: [nextSequence, [Validators.required, Validators.min(1)]],
          workerGroupIds: [[]],
        },
        {
          validators: [
            CustomValidators.dateRange('plannedStartDate', 'plannedEndDate'),
          ],
        },
      );
    }
  }

  onSubmit(): void {
    if (this.phaseForm.invalid) {
      this.phaseForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.phaseForm.value;

    const payload: Record<string, unknown> = {
      ...formValue,
      plannedStartDate: formValue.plannedStartDate
        ? new Date(formValue.plannedStartDate).toISOString()
        : null,
      plannedEndDate: formValue.plannedEndDate
        ? new Date(formValue.plannedEndDate).toISOString()
        : null,
    };

    if (this.isEditMode) {
      payload['actualStartDate'] = formValue.actualStartDate
        ? new Date(formValue.actualStartDate).toISOString()
        : null;
      payload['actualEndDate'] = formValue.actualEndDate
        ? new Date(formValue.actualEndDate).toISOString()
        : null;
    }

    this.dialogRef.close(payload);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
