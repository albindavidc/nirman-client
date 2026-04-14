import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { SharedModalComponent } from '../../../../../../shared/components/shared-modal/shared-modal.component';
import { CustomValidators } from '../../../../../../shared/validators/custom-validators';
import { WorkerGroup } from '../../../../workers/models/worker-group.model';
import { WorkerGroupService } from '../../../../workers/services/worker-group.service';
import {
  ProjectPhase,
  ProjectWorkerWithUser,
} from '../../../models/project.models';
import { ProjectPhaseService } from '../../../services/project-phase.service';
import { ProjectService } from '../../../services/project.service';
import {
  CreateTaskDto,
  Task,
  TaskService,
} from '../../../services/task.service';

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
    MatCheckboxModule,
    MatDividerModule,
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
  private workerGroupService = inject(WorkerGroupService);
  public dialogRef = inject(MatDialogRef<TaskModalComponent>);
  public data = inject<TaskModalData>(MAT_DIALOG_DATA);
  private destroyRef = inject(DestroyRef);

  taskForm!: FormGroup;
  isSubmitting = false;
  mode: 'create' | 'edit' = 'create';

  workers: ProjectWorkerWithUser[] = [];
  workerGroups: WorkerGroup[] = [];
  phases: ProjectPhase[] = [];

  ngOnInit(): void {
    this.mode = this.data.mode;
    this.initForm();
    this.setupFilters();
    this.initialLoad();
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
        workerIds: [
          task?.assignments?.filter((a) => a.userId).map((a) => a.userId) || [],
        ],
        workerGroupIds: [
          task?.assignments
            ?.filter((a) => a.workerGroupId)
            .map((a) => a.workerGroupId) || [],
        ],
        assignments: this.fb.array([]),
        plannedStartDate: [
          task?.plannedStartDate ? new Date(task.plannedStartDate) : new Date(),
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
        estimatedHours: [task?.estimatedHours || null, [Validators.min(0)]],
        actualHours: [task?.actualHours || null, [Validators.min(0)]],
        color: [task?.color || '#3b82f6'],
      },
      {
        validators: [
          CustomValidators.dateRange('plannedStartDate', 'plannedEndDate'),
          CustomValidators.dateRange('actualStartDate', 'actualEndDate'),
        ],
      },
    );
  }

  private initialLoad(): void {
    // Initial load of phases is always needed
    this.phaseService.getPhases(this.data.projectId).subscribe((phases) => {
      this.phases = phases;

      // In edit mode, load the phase data and then assignments
      const phaseId = this.taskForm.get('phaseId')?.value;
      if (phaseId && this.mode === 'edit') {
        this.loadWorkerGroups(phaseId, false);
      }
    });

    const phaseId = this.taskForm.get('phaseId')?.value;
    if (phaseId && this.mode === 'create') {
      this.loadWorkerGroups(phaseId);
    }
  }

  private setupFilters(): void {
    // Listen to Phase changes
    this.taskForm
      .get('phaseId')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((phaseId) => {
        if (phaseId) {
          this.loadWorkerGroups(phaseId);
        } else {
          this.workerGroups = [];
          this.workers = [];
        }
        // Clear dependent selections
        this.taskForm.get('workerGroupIds')?.setValue([]);
        this.taskForm.get('workerIds')?.setValue([]);
      });

    // Listen to Worker Group selection changes
    this.taskForm
      .get('workerGroupIds')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((groupIds: string[]) => {
        if (groupIds && groupIds.length > 0) {
          // If groups are specifically selected, we filter workers to those in the selected groups
          const selectedGroups = this.workerGroups.filter((g) =>
            groupIds.includes(g.id),
          );
          this.syncWorkersFromGroups(selectedGroups);

          // Auto-populate workers from these groups
          const selectedGroupWorkers = selectedGroups.flatMap((g) =>
            (g.workers || []).map((w) => w.userId),
          );

          const currentWorkerIds =
            (this.taskForm.get('workerIds')?.value as string[]) || [];
          const mergedWorkerIds = Array.from(
            new Set([...currentWorkerIds, ...selectedGroupWorkers]),
          );

          if (mergedWorkerIds.length !== currentWorkerIds.length) {
            this.taskForm
              .get('workerIds')
              ?.patchValue(mergedWorkerIds, { emitEvent: true });
          }
        } else {
          // If no groups are specifically selected, fall back to phase workplace
          const phaseId = this.taskForm.get('phaseId')?.value;
          if (phaseId) {
            this.loadWorkerGroups(phaseId, false);
          } else {
            this.loadProjectWorkers();
          }
        }
        this.updateAssignmentsArray();
      });

    // Listen to Worker selection changes
    this.taskForm
      .get('workerIds')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateAssignmentsArray();
      });
  }

  get assignmentControls() {
    return (this.taskForm.get('assignments') as FormArray).controls;
  }

  trackByIndex(index: number): number {
    return index;
  }

  private updateAssignmentsArray(): void {
    const workerIds = (this.taskForm.get('workerIds')?.value as string[]) || [];
    const groupIds =
      (this.taskForm.get('workerGroupIds')?.value as string[]) || [];
    const assignmentsArray = this.taskForm.get('assignments') as FormArray;

    if (!assignmentsArray) return;

    // Get current assignments to preserve their state (notes, isActive)
    const currentItems = assignmentsArray.controls.map((c) => c.value);

    // Create new list of desired assignments
    const newItems: any[] = [];

    // 1. Process Groups
    groupIds.forEach((id) => {
      const existing = currentItems.find((a) => a.workerGroupId === id);
      const group = this.workerGroups.find((g) => g.id === id);
      newItems.push({
        workerGroupId: id,
        userId: null,
        name: group?.name || 'Unknown Group',
        type: 'Group',
        isActive: existing ? existing.isActive : true,
        notes: existing ? existing.notes : '',
        assignedByName: existing ? existing.assignedByName : '',
        assignedAt: existing ? existing.assignedAt : null,
      });
    });

    // 2. Process Individual Workers
    workerIds.forEach((id) => {
      const existing = currentItems.find((a) => a.userId === id);
      const worker = this.workers.find((w) => w.user?.id === id);

      // Try to find the worker in the workerGroups as well if not in the global project workers list
      let name = 'Unknown Worker';
      if (worker) {
        name = `${worker.user?.firstName} ${worker.user?.lastName}`;
      } else {
        // Search in groups
        for (const g of this.workerGroups) {
          const m = (g.workers || []).find((w) => w.userId === id);
          if (m) {
            name = m.workerName || 'Unknown Worker';
            break;
          }
        }
      }

      const groupName = this.getWorkerGroupName(id);

      newItems.push({
        workerGroupId: null,
        userId: id,
        name: name,
        groupName: groupName,
        type: 'Worker',
        isActive: existing ? existing.isActive : true,
        notes: existing ? existing.notes : '',
        assignedByName: existing ? existing.assignedByName : '',
        assignedAt: existing ? existing.assignedAt : null,
      });
    });

    // 3. Reconcile FormArray (Stable Update)
    // Remove items that are no longer present
    for (let i = assignmentsArray.length - 1; i >= 0; i--) {
      const ctrl = assignmentsArray.at(i);
      const val = ctrl.value;
      const stillExists = newItems.some(
        (n) =>
          (n.userId && n.userId === val.userId) ||
          (n.workerGroupId && n.workerGroupId === val.workerGroupId),
      );
      if (!stillExists) {
        assignmentsArray.removeAt(i);
      }
    }

    // Add or Update items
    newItems.forEach((n) => {
      const existingIdx = assignmentsArray.controls.findIndex((c) => {
        const val = c.value;
        return (
          (n.userId && n.userId === val.userId) ||
          (n.workerGroupId && n.workerGroupId === val.workerGroupId)
        );
      });

      if (existingIdx > -1) {
        // Update basic info but keep user-edited fields
        const ctrl = assignmentsArray.at(existingIdx) as FormGroup;
        ctrl.patchValue(
          {
            name: n.name,
            groupName: n.groupName,
            type: n.type,
          },
          { emitEvent: false },
        );
      } else {
        // Add new
        assignmentsArray.push(
          this.fb.group({
            workerGroupId: [n.workerGroupId],
            userId: [n.userId],
            name: [n.name],
            groupName: [n.groupName || ''],
            type: [n.type],
            isActive: [n.isActive],
            notes: [n.notes],
            assignedByName: [n.assignedByName],
            assignedAt: [n.assignedAt],
          }),
        );
      }
    });
  }

  private loadWorkerGroups(phaseId: string, autoSelect: boolean = true): void {
    // If we're explicitly loading for a phase, we should probably see all groups assigned to it
    // isActive: undefined ensures we don't accidentally hide groups during configuration
    this.workerGroupService
      .getGroups(undefined, undefined, undefined, this.data.projectId, phaseId)
      .subscribe((groups) => {
        this.workerGroups = groups || [];

        // Auto-select if there's only one group and it's a new task
        if (autoSelect && this.mode === 'create' && groups.length === 1) {
          this.taskForm.get('workerGroupIds')?.setValue([groups[0].id]);
        }

        // Extract and map all potential workers from these groups
        if (groups.length > 0) {
          this.syncWorkersFromGroups(groups);
        } else {
          this.loadProjectWorkers();
        }

        if (this.mode === 'edit' && this.data.task?.assignments) {
          this.populateInitialAssignments();
        }
      });
  }

  /**
   * Helper to flatten and map group members to ProjectWorkerWithUser format
   */
  private syncWorkersFromGroups(groups: WorkerGroup[]): void {
    const rawMembers = groups.flatMap((g) => g.workers || []);

    // Deduplicate by userId
    const uniqueMembers = Array.from(
      new Map(rawMembers.map((m) => [m.userId, m])).values(),
    );

    // Map to ProjectWorkerWithUser format for the template
    this.workers = uniqueMembers.map((m) => {
      // Split name for template
      const nameParts = m.workerName?.split(' ') || [];
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || '';

      return {
        userId: m.userId,
        role: 'Worker', // Default role for members
        joinedAt: new Date(m.createdAt),
        isCreator: false,
        user: {
          id: m.userId,
          firstName,
          lastName,
          fullName: m.workerName,
          email: '',
          phone: '',
          profilePhoto: m.workerPhotoUrl || undefined,
          title: '',
        },
      };
    });

    if (this.mode === 'edit' && this.data.task?.assignments) {
      this.populateInitialAssignments();
    }
  }

  private loadProjectWorkers(): void {
    this.projectService
      .getProjectWorkers(this.data.projectId)
      .subscribe((workers) => {
        this.workers = workers;
        if (this.mode === 'edit' && this.data.task?.assignments) {
          this.populateInitialAssignments();
        }
      });
  }


  private populateInitialAssignments(): void {
    const task = this.data.task;
    if (!task?.assignments) return;

    const assignmentsArray = this.taskForm.get('assignments') as FormArray;
    // Only populate if empty
    if (!assignmentsArray || assignmentsArray.length > 0) return;

    task.assignments.forEach((a) => {
      let name = 'Unknown';
      let type = '';
      let groupName = '';

      if (a.workerGroupId) {
        name =
          a.workerGroup?.name ||
          this.workerGroups.find((g) => g.id === a.workerGroupId)?.name ||
          'Group';
        type = 'Group';
      } else if (a.userId) {
        // Try to resolve name from payload, then local workers list, then team profiles
        const user = a.user;
        if (user) {
          name = `${user.firstName} ${user.lastName}`;
        } else {
          const worker = this.workers.find((w) => w.user?.id === a.userId);
          if (worker?.user) {
            name = `${worker.user.firstName} ${worker.user.lastName}`;
          } else {
            // Search in groups
            for (const g of this.workerGroups) {
              const m = (g.workers || []).find((w) => w.userId === a.userId);
              if (m) {
                name = m.workerName || 'Worker';
                break;
              }
            }
          }
        }
        type = 'Worker';
        groupName =
          a.workerGroup?.name || this.getWorkerGroupName(a.userId) || '';
      }

      assignmentsArray.push(
        this.fb.group({
          workerGroupId: [a.workerGroupId],
          userId: [a.userId],
          name: [name],
          groupName: [groupName],
          type: [type],
          isActive: [a.isActive],
          notes: [a.notes || ''],
          assignedByName: [
            a.user ? `${a.user.firstName} ${a.user.lastName}` : 'System',
          ],
          assignedAt: [a.assignedAt],
        }),
      );
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
    if (formValue.description) dto.description = formValue.description;
    if (formValue.phaseId) dto.phaseId = formValue.phaseId;
    if (formValue.priority) dto.priority = formValue.priority;
    if (formValue.status) dto.status = formValue.status;

    if (formValue.workerIds) dto.workerIds = formValue.workerIds;
    if (formValue.workerGroupIds) dto.workerGroupIds = formValue.workerGroupIds;

    if (formValue.assignments && formValue.assignments.length > 0) {
      dto.assignments = formValue.assignments.map((a: any) => ({
        userId: a.userId,
        workerGroupId: a.workerGroupId,
        isActive: a.isActive,
        notes: a.notes,
      }));
    }

    if (formValue.plannedStartDate) {
      dto.plannedStartDate = new Date(formValue.plannedStartDate).toISOString();
    }
    if (formValue.plannedEndDate) {
      dto.plannedEndDate = new Date(formValue.plannedEndDate).toISOString();
    }

    if (
      formValue.estimatedHours !== null &&
      formValue.estimatedHours !== undefined
    ) {
      dto.estimatedHours = Number(formValue.estimatedHours);
    }
    if (formValue.color) dto.color = formValue.color;

    if (this.mode === 'edit') {
      if (formValue.progress !== undefined) dto.progress = formValue.progress;
      if (formValue.notes !== undefined) dto.notes = formValue.notes;
      if (formValue.actualStartDate) {
        dto.actualStartDate = new Date(formValue.actualStartDate).toISOString();
      }
      if (formValue.actualEndDate) {
        dto.actualEndDate = new Date(formValue.actualEndDate).toISOString();
      }
      if (
        formValue.actualHours !== null &&
        formValue.actualHours !== undefined
      ) {
        dto.actualHours = Number(formValue.actualHours);
      }
    }

    if (this.mode === 'create') {
      this.taskService.createTask(dto as CreateTaskDto).subscribe({
        next: () => {
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

  getWorkerGroupName(userId: string): string {
    if (!userId) return '';
    const group = this.workerGroups.find((g) =>
      (g.workers || []).some((w) => w.userId === userId),
    );
    return group ? group.name : '';
  }
}
