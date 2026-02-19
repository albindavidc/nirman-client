import { Component, Inject, OnInit, inject } from '@angular/core';
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
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { ProjectPhaseService } from '../../services/project-phase.service';
import { ProjectMemberWithUser } from '../../models/project.models';
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

  taskForm: FormGroup;
  isSubmitting = false;
  projectMembers: ProjectMemberWithUser[] = [];
  phases: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<CreateTaskModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { projectId: string; phaseId?: string },
  ) {
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
      description: ['', [Validators.maxLength(500)]],
      phaseId: [data.phaseId || '', Validators.required],
      priority: ['Medium', Validators.required],
      status: ['Not Started', Validators.required],
      assignedTo: [null],
      plannedStartDate: [null],
      plannedEndDate: [null],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formValue = this.taskForm.value;

    // Construct DTO, ensuring we don't send 'null' for fields that expect string/dateString
    const dto: any = {
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

    // Note: projectId is not in CreateTaskDto, so we don't send it.
    // The backend likely infers project context from Phase or doesn't need it for task creation logic yet.

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
    // 1. Fetch Project Members
    this.projectService
      .getProjectMembers(this.data.projectId)
      .subscribe((members) => {
        this.projectMembers = members;
      });

    // 2. Fetch Phases (if not provided, or even if provided to allow switching)
    this.phaseService.getPhases(this.data.projectId).subscribe((phases) => {
      this.phases = phases;
      // If phaseId passed but not in list (rare), or need default
      if (!this.taskForm.get('phaseId')?.value && phases.length > 0) {
        // Optional: auto-select first phase
      }
    });
  }
}
