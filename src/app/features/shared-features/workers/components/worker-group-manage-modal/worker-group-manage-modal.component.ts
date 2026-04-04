import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
  WorkerGroup,
  WorkerGroupMember,
} from '../../models/worker-group.model';
import { Worker } from '../../models/worker.model';
import * as WorkerGroupActions from '../../store/worker-group.actions';
import * as WorkerGroupSelectors from '../../store/worker-group.selectors';
import * as WorkerActions from '../../store/worker.actions';
import * as WorkerSelectors from '../../store/worker.selectors';

export interface WorkerGroupManageModalData {
  group: WorkerGroup;
}

@Component({
  selector: 'app-worker-group-manage-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCheckboxModule,
  ],
  templateUrl: './worker-group-manage-modal.component.html',
  styleUrl: './worker-group-manage-modal.component.scss',
})
export class WorkerGroupManageModalComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private dialogRef = inject(MatDialogRef<WorkerGroupManageModalComponent>);
  private destroy$ = new Subject<void>();

  selectedGroup$: Observable<WorkerGroup | null>;
  loading$: Observable<boolean>;
  allWorkers$: Observable<Worker[]>;

  searchControl = new FormControl('');
  currentGroup: WorkerGroup;
  changesMade = false;

  // Workers selected for adding
  selectedWorkerIds = new Set<string>();
  searchTerm = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: WorkerGroupManageModalData,
  ) {
    this.currentGroup = data.group;
    this.selectedGroup$ = this.store.select(
      WorkerGroupSelectors.selectSelectedGroup,
    );
    this.loading$ = this.store.select(WorkerGroupSelectors.selectActionLoading);
    this.allWorkers$ = this.store.select(WorkerSelectors.selectAllWorkers);
  }

  ngOnInit(): void {
    this.store.dispatch(
      WorkerGroupActions.loadGroupById({ id: this.data.group.id }),
    );
    this.store.dispatch(WorkerActions.loadWorkers({ page: 1, limit: 200 }));

    this.selectedGroup$.pipe(takeUntil(this.destroy$)).subscribe((g) => {
      if (g && g.id === this.data.group.id) {
        this.currentGroup = g;
      }
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((val) => {
        this.searchTerm = val ?? '';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  getActiveMembers(): WorkerGroupMember[] {
    return this.currentGroup.workers.filter((m) => m.isActive && !m.isDeleted);
  }

  removeMember(member: WorkerGroupMember): void {
    this.changesMade = true;
    this.store.dispatch(
      WorkerGroupActions.removeMember({
        groupId: this.currentGroup.id,
        workerId: member.userId, // use userId as the handler expects User ID to find Professional
      }),
    );
  }

  isMember(workerId: string): boolean {
    if (!this.currentGroup?.workers) return false;
    // Check against both professionalId and userId to ensure matching across different ID systems
    return this.currentGroup.workers.some(
      (m) =>
        (m.workerId === workerId || m.userId === workerId) &&
        m.isActive &&
        !m.isDeleted,
    );
  }

  getAvailableWorkers(allWorkers: Worker[] | null): Worker[] {
    if (!allWorkers) return [];

    // 1. First, strip out anybody already in the group
    const filtered = allWorkers.filter((w) => !this.isMember(w.id));

    // 2. Then apply the search term if any
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return filtered;

    return filtered.filter(
      (w) =>
        (w.firstName + ' ' + w.lastName).toLowerCase().includes(term) ||
        (w.role || '').toLowerCase().includes(term) ||
        (w.email || '').toLowerCase().includes(term),
    );
  }

  toggleWorkerSelection(workerId: string): void {
    if (this.selectedWorkerIds.has(workerId)) {
      this.selectedWorkerIds.delete(workerId);
    } else {
      this.selectedWorkerIds.add(workerId);
    }
  }

  isWorkerSelected(workerId: string): boolean {
    return this.selectedWorkerIds.has(workerId);
  }

  addSelectedWorkers(): void {
    if (this.selectedWorkerIds.size === 0) return;

    this.changesMade = true;
    this.selectedWorkerIds.forEach((workerId) => {
      this.store.dispatch(
        WorkerGroupActions.addMember({
          groupId: this.currentGroup.id,
          workerId,
        }),
      );
    });

    this.selectedWorkerIds.clear();
    this.searchControl.reset();
    this.onClose();
  }

  onClose(): void {
    this.dialogRef.close(this.changesMade);
  }
}
