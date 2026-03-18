import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CustomValidators } from '../../../../../shared/validators/custom-validators';
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
import { TaskService, CreateTaskDto } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { ProjectPhaseService } from '../../services/project-phase.service';
import {
  ProjectWorkerWithUser,
  ProjectPhase,
} from '../../models/project.models';
import { SharedModalComponent } from '../../../../../shared/components/shared-modal/shared-modal.component';

@Component({
  selector: 'app-create-task-modal',
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
  templateUrl: './create-task-modal.component.html',
  styleUrls: ['./create-task-modal.component.scss'],
})
export class CreateTaskModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private phaseService = inject(ProjectPhaseService);
  public dialogRef = inject(MatDialogRef<CreateTaskModalComponent>);
  public data = inject<{ projectId: string; phaseId?: string }>(
    MAT_DIALOG_DATA,
  );

  taskForm!: FormGroup;
  isSubmitting = false;
  workers: ProjectWorkerWithUser[] = [];
  phases: ProjectPhase[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
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
      phaseId: [this.data.phaseId || '', Validators.required],
      priority: ['Medium', Validators.required],
      status: ['Not Started', Validators.required],
      assignedTo: [null],
      plannedStartDate: [null],
      plannedEndDate: [null],
    },
    { validators: CustomValidators.dateRange('plannedStartDate', 'plannedEndDate') });
  }

  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formValue = this.taskForm.value;

    const dto: CreateTaskDto = {
      name: formValue.name,
      phaseId: formValue.phaseId,
      priority: formValue.priority,
      status: formValue.status,
    };

    if (formValue.description) {
      dto.description = formValue.description;
    }

    if (formValue.assignedTo) {
      dto.assignedTo = formValue.assignedTo;
    }

    if (formValue.plannedStartDate) {
      dto.plannedStartDate = new Date(formValue.plannedStartDate).toISOString();
    }

    if (formValue.plannedEndDate) {
      dto.plannedEndDate = new Date(formValue.plannedEndDate).toISOString();
    }

    this.taskService.createTask(dto).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
      },
    });
  }

  loadData() {
    // 1. Fetch Project Workers
    this.projectService
      .getProjectWorkers(this.data.projectId)
      .subscribe((workers) => {
        this.workers = workers;
      });

    // 2. Fetch Phases
    this.phaseService.getPhases(this.data.projectId).subscribe((phases) => {
      this.phases = phases;
    });
  }
}
