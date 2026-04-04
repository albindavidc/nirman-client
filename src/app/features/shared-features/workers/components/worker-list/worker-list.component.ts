import { Component, OnInit, ViewChild, inject } from '@angular/core';
import {
  CommonModule,
  TitleCasePipe,
  AsyncPipe,
  UpperCasePipe,
} from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Worker } from '../../models/worker.model';
import * as WorkerActions from '../../store/worker.actions';
import * as WorkerSelectors from '../../store/worker.selectors';
import { WorkerAddEditModalComponent } from '../worker-add-edit-modal/worker-add-edit-modal.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../../shared/components/table/table.models';
import { PageEvent } from '@angular/material/paginator';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SearchBarComponent } from '../../../../../shared/components/search-bar/search-bar.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { WorkerGroupListComponent } from '../worker-group-list/worker-group-list.component';

@Component({
  selector: 'app-worker-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    ReactiveFormsModule,
    TableComponent,
    TitleCasePipe,
    AsyncPipe,
    UpperCasePipe,
    SearchBarComponent,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    WorkerGroupListComponent,
  ],
  templateUrl: './worker-list.component.html',
  styleUrl: './worker-list.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(15px)' }),
            stagger('50ms', [
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' }),
              ),
            ]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
})
export class WorkerListComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);

  /** Reference to the embedded group list so the header button can delegate to it. */
  @ViewChild(WorkerGroupListComponent)
  private groupListRef!: WorkerGroupListComponent;

  // ─── Tab State ───────────────────────────────────────────────────────────
  activeTab: 'workers' | 'groups' = 'workers';

  columns: TableColumn[] = [
    { key: 'worker', header: 'Worker', type: 'template', sortable: true },
    { key: 'role', header: 'Role', type: 'template', sortable: true },
    { key: 'skills', header: 'Skills', type: 'template' },
    { key: 'email', header: 'Email', type: 'template', sortable: true },
    { key: 'phoneNumber', header: 'Phone', type: 'text' },
    { key: 'createdAt', header: 'Joined Date', type: 'date', sortable: true },
    { key: 'status', header: 'Status', type: 'template', sortable: true },
    { key: 'actions', header: 'Actions', type: 'template' },
  ];

  totalWorkers$: Observable<number>;
  workers$: Observable<Worker[]>;
  loading$: Observable<boolean>;
  workerCount$: Observable<number>;
  supervisorCount$: Observable<number>;
  activeCount$: Observable<number>;

  roleControl = new FormControl('');

  pageSize = 10;
  pageIndex = 0;
  searchTerm = '';

  constructor() {
    this.totalWorkers$ = this.store.select(WorkerSelectors.selectWorkerTotal);
    this.loading$ = this.store.select(WorkerSelectors.selectWorkerLoading);
    this.workers$ = this.store.select(WorkerSelectors.selectAllWorkers);

    this.workerCount$ = this.workers$.pipe(
      map(
        (workers: Worker[]) =>
          workers.filter((m) => m.role === 'worker').length,
      ),
    );
    this.supervisorCount$ = this.workers$.pipe(
      map(
        (workers: Worker[]) =>
          workers.filter((m) => m.role === 'supervisor').length,
      ),
    );
    this.activeCount$ = this.workers$.pipe(
      map(
        (workers: Worker[]) =>
          workers.filter((m) => m.userStatus === 'active').length,
      ),
    );
  }

  ngOnInit(): void {
    this.loadWorkers();

    this.roleControl.valueChanges.subscribe(() => {
      this.pageIndex = 0;
      this.loadWorkers();
    });
  }

  setTab(tab: 'workers' | 'groups'): void {
    this.activeTab = tab;
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.pageIndex = 0;
    this.loadWorkers();
  }

  loadWorkers() {
    this.store.dispatch(
      WorkerActions.loadWorkers({
        page: this.pageIndex + 1,
        limit: this.pageSize,
        search: this.searchTerm || '',
        role: this.roleControl.value || '',
      }),
    );
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadWorkers();
  }

  openAddModal() {
    this.dialog.open(WorkerAddEditModalComponent, {
      width: '600px',
      data: { mode: 'add' },
    });
  }

  openEditModal(worker: Worker) {
    this.dialog.open(WorkerAddEditModalComponent, {
      width: '600px',
      data: { mode: 'edit', worker },
    });
  }

  blockWorker(worker: Worker) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Block Worker',
        message: `Are you sure you want to block ${worker.firstName}?`,
        confirmButtonText: 'Block',
        confirmButtonColor: 'warn',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(WorkerActions.blockWorker({ id: worker.id }));
      }
    });
  }

  unblockWorker(worker: Worker) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Unblock Worker',
        message: `Are you sure you want to unblock ${worker.firstName}?`,
        confirmButtonText: 'Unblock',
        confirmButtonColor: 'primary',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(WorkerActions.unblockWorker({ id: worker.id }));
      }
    });
  }

  getSkillsTooltip(skills: string[] | undefined): string {
    return skills ? skills.slice(2).join(', ') : '';
  }

  openCreateGroupModal(): void {
    // Delegate to the embedded WorkerGroupListComponent so both
    // entry-points (header button + empty-state button) share the
    // same dialog config and post-create refresh logic.
    this.groupListRef?.openCreateModal();
  }
}
