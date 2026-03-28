import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CustomValidators } from '../../../../../../shared/validators/custom-validators';
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
import { MatSliderModule } from '@angular/material/slider';
import {
  Task,
  TaskService,
  CreateTaskDto,
} from '../../../services/task.service';
import { ProjectService } from '../../../services/project.service';
import { ProjectPhaseService } from '../../../services/project-phase.service';
import {
  ProjectWorkerWithUser,
  ProjectPhase,
} from '../../../models/project.models';
import { SharedModalComponent } from '../../../../../../shared/components/shared-modal/shared-modal.component';

export interface TaskModalData {
  mode: 'create' | 'edit';
  projectId: string;
  phaseId?: string;
  task?: Task;
}

@Component({
  selector: 'app-task-modal',
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
    MatSliderModule,
    SharedModalComponent,
  ],
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.scss'],
})
export class TaskModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private phaseService = inject(ProjectPhaseService);
  public dialogRef = inject(MatDialogRef<TaskModalComponent>);
  public data = inject<TaskModalData>(MAT_DIALOG_DATA);

  taskForm!: FormGroup;
  isSubmitting = false;
  mode: 'create' | 'edit' = 'create';

  workers: ProjectWorkerWithUser[] = [];
  phases: ProjectPhase[] = [];

  ngOnInit(): void {
    this.mode = this.data.mode;
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    const task = this.data.task;

    this.taskForm = this.fb.group(
      {
        name: [
          task?.name || '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
            CustomValidators.noWhitespace(),
          ],
        ],
        description: [
          task?.description || '',
          [Validators.maxLength(500), CustomValidators.noWhitespace()],
        ],
        phaseId: [
          task?.phaseId || this.data.phaseId || '',
          Validators.required,
        ],
        priority: [task?.priority || 'Medium', Validators.required],
        status: [task?.status || 'Not Started', Validators.required],
        assignedTo: [task?.assignedTo || null],
        plannedStartDate: [
          task?.plannedStartDate ? new Date(task.plannedStartDate) : null,
        ],
        plannedEndDate: [
          task?.plannedEndDate ? new Date(task.plannedEndDate) : null,
        ],
        // Edit-only fields initialized regardless, rendered conditionally
        actualStartDate: [
          task?.actualStartDate ? new Date(task.actualStartDate) : null,
        ],
        actualEndDate: [
          task?.actualEndDate ? new Date(task.actualEndDate) : null,
        ],
        progress: [
          task?.progress || 0,
          [Validators.min(0), Validators.max(100)],
        ],
        notes: [
          task?.notes || '',
          [Validators.maxLength(1000), CustomValidators.noWhitespace()],
        ],
      },
      {
        validators: [
          CustomValidators.dateRange('plannedStartDate', 'plannedEndDate'),
          CustomValidators.dateRange('actualStartDate', 'actualEndDate'),
        ],
      },
    );
  }

  private loadData(): void {
    this.projectService
      .getProjectWorkers(this.data.projectId)
      .subscribe((workers) => {
        this.workers = workers;
      });

    this.phaseService.getPhases(this.data.projectId).subscribe((phases) => {
      this.phases = phases;
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formValue = this.taskForm.value;

    const dto: any = {};

    if (formValue.name) dto.name = formValue.name;
    if (formValue.description !== undefined)
      dto.description = formValue.description;
    if (formValue.phaseId) dto.phaseId = formValue.phaseId;
    if (formValue.priority) dto.priority = formValue.priority;
    if (formValue.status) dto.status = formValue.status;

    dto.assignedTo = formValue.assignedTo || null;

    if (formValue.plannedStartDate) {
      dto.plannedStartDate = new Date(formValue.plannedStartDate).toISOString();
    }
    if (formValue.plannedEndDate) {
      dto.plannedEndDate = new Date(formValue.plannedEndDate).toISOString();
    }

    // Only send edit-specific fields if we are strictly updating
    if (this.mode === 'edit') {
      if (formValue.progress !== undefined) dto.progress = formValue.progress;
      if (formValue.notes !== undefined) dto.notes = formValue.notes;
      if (formValue.actualStartDate) {
        dto.actualStartDate = new Date(formValue.actualStartDate).toISOString();
      }
      if (formValue.actualEndDate) {
        dto.actualEndDate = new Date(formValue.actualEndDate).toISOString();
      }
    }

    if (this.mode === 'create') {
      this.taskService.createTask(dto as CreateTaskDto).subscribe({
        next: (task) => {
          this.isSubmitting = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error creating task:', err);
          this.isSubmitting = false;
        },
      });
    } else {
      if (!this.data.task) return;
      this.taskService.updateTask(this.data.task.id, dto).subscribe({
        next: (updatedTask) => {
          this.isSubmitting = false;
          this.dialogRef.close(updatedTask);
        },
        error: (err) => {
          console.error('Error updating task:', err);
          this.isSubmitting = false;
        },
      });
    }
  }

  formatProgressLabel(value: number): string {
    return `${value}%`;
  }
}
