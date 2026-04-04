import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
  TRADE_ICONS,
  TRADE_LABELS,
} from '../../constants/worker-group.constants';
import { TradeType, WorkerGroup } from '../../models/worker-group.model';
import * as WorkerGroupActions from '../../store/worker-group.actions';
import * as WorkerGroupSelectors from '../../store/worker-group.selectors';
import {
  DeleteGroupDialogComponent,
  DeleteGroupDialogData,
} from '../delete-group-dialog/delete-group-dialog.component';
import {
  WorkerGroupManageModalComponent,
  WorkerGroupManageModalData,
} from '../worker-group-manage-modal/worker-group-manage-modal.component';
import {
  WorkerGroupModalComponent,
  WorkerGroupModalData,
} from '../worker-group-modal/worker-group-modal.component';

@Component({
  selector: 'app-worker-group-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './worker-group-list.component.html',
  styleUrl: './worker-group-list.component.scss',
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
    trigger('cardGrid', [
      transition(':enter', [
        query(
          '.group-card',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('60ms', [
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
export class WorkerGroupListComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  private injector = inject(Injector);
  private viewContainerRef = inject(ViewContainerRef);
  private destroy$ = new Subject<void>();

  groups$: Observable<WorkerGroup[]>;
  loading$: Observable<boolean>;
  total$: Observable<number>;
  activeCount$: Observable<number>;

  tradeControl = new FormControl<TradeType | ''>('');
  searchTerm = '';

  trades = Object.entries(TRADE_LABELS) as [TradeType, string][];
  tradeLabels = TRADE_LABELS;
  tradeIcons = TRADE_ICONS;

  showAllMembers: Record<string, boolean> = {};

  constructor() {
    this.groups$ = this.store.select(WorkerGroupSelectors.selectAllGroups);
    this.loading$ = this.store.select(WorkerGroupSelectors.selectListLoading);
    this.total$ = this.store.select(WorkerGroupSelectors.selectGroupsTotal);
    this.activeCount$ = this.store.select(
      WorkerGroupSelectors.selectActiveGroupsCount,
    );
  }

  ngOnInit(): void {
    this.loadGroups();

    this.tradeControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.loadGroups());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGroups(): void {
    this.store.dispatch(
      WorkerGroupActions.loadGroups({
        trade: (this.tradeControl.value as TradeType) || undefined,
        search: this.searchTerm || undefined,
      }),
    );
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.loadGroups();
  }

  openCreateModal(): void {
    const data: WorkerGroupModalData = { mode: 'create' };
    this.dialog.open(WorkerGroupModalComponent, {
      panelClass: 'zero-padding-dialog',
      maxWidth: '520px',
      width: '100%',
      maxHeight: '90vh',
      data,
      injector: this.injector,
      viewContainerRef: this.viewContainerRef,
    });
  }

  openEditModal(group: WorkerGroup): void {
    const data: WorkerGroupModalData = { mode: 'edit', group };
    this.dialog.open(WorkerGroupModalComponent, {
      panelClass: 'zero-padding-dialog',
      maxWidth: '520px',
      width: '100%',
      maxHeight: '90vh',
      data,
      injector: this.injector,
      viewContainerRef: this.viewContainerRef,
    });
  }

  openManageModal(group: WorkerGroup): void {
    this.store.dispatch(WorkerGroupActions.selectGroup({ group }));
    const data: WorkerGroupManageModalData = { group };
    const dialogRef = this.dialog.open(WorkerGroupManageModalComponent, {
      panelClass: 'zero-padding-dialog',
      maxWidth: '520px',
      width: '100%',
      maxHeight: '90vh',
      data,
      viewContainerRef: this.viewContainerRef,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((changesMade: boolean) => {
        if (changesMade) {
          this.loadGroups();
        }
      });
  }

  deleteGroup(group: WorkerGroup): void {
    const dialogRef = this.dialog.open(DeleteGroupDialogComponent, {
      panelClass: 'zero-padding-dialog',
      width: '420px',
      maxWidth: '95vw',
      data: { groupName: group.name } as DeleteGroupDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(WorkerGroupActions.deleteGroup({ id: group.id }));
      }
    });
  }

  toggleShowAllMembers(groupId: string): void {
    this.showAllMembers[groupId] = !this.showAllMembers[groupId];
  }

  getActiveMembers(group: WorkerGroup) {
    return (group.workers || []).filter((m) => m.isActive);
  }

  getActiveMembersCount(group: WorkerGroup): number {
    return this.getActiveMembers(group).length;
  }

  getVisibleMembers(group: WorkerGroup) {
    const active = this.getActiveMembers(group);
    return this.showAllMembers[group.id] ? active : active.slice(0, 4);
  }

  getMemberInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
