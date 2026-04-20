import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { WorkerGroup } from '../../models/worker-group.model';
import { TradeType } from '../../models/trade-type.model';
import { TRADE_LABELS } from '../../constants/worker-group.constants';
import { Worker } from '../../models/worker.model';
import * as WorkerGroupActions from '../../store/worker-group.actions';
import * as WorkerGroupSelectors from '../../store/worker-group.selectors';
import * as WorkerSelectors from '../../store/worker.selectors';
import * as WorkerActions from '../../store/worker.actions';

export interface WorkerGroupModalData {
  mode: 'create' | 'edit';
  group?: WorkerGroup;
}

@Component({
  selector: 'app-worker-group-modal',
  standalone: true,
  imports: [
    CommonModule,
    TitleCasePipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './worker-group-modal.component.html',
  styleUrl: './worker-group-modal.component.scss',
})
export class WorkerGroupModalComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private dialogRef = inject(MatDialogRef<WorkerGroupModalComponent>);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  form!: FormGroup;
  submitting = false; // Local flag — only true when user clicks Save
  allWorkers: Worker[] = [];
  isEdit = false;

  /** All available trade types as [value, label] pairs - Hardcoded fallback for reliability */
  trades: [TradeType, string][] = [
    ['ELECTRICIAN', 'Electrician'],
    ['PLUMBER', 'Plumber'],
    ['CARPENTER', 'Carpenter'],
    ['MASON', 'Masonry'],
    ['PAINTER', 'Painting'],
    ['TILER', 'Tiling'],
    ['WELDER', 'Welding'],
    ['HELPER', 'Helper'],
    ['DRIVER', 'Driver'],
    ['LABOUR', 'Labour'],
    ['OTHER', 'Other'],
  ];

  /** Set of selected worker IDs for the "Add Team Members" picker */
  selectedWorkerIds = new Set<string>();

  /** Search control bound to the member search input */
  memberSearchControl = new FormControl('');
  memberSearchTerm = '';

  public data = inject<WorkerGroupModalData>(MAT_DIALOG_DATA);

  constructor() {
    // 1. Synchronous Initialization
    this.data = this.data || { mode: 'create' };
    this.isEdit = this.data.mode === 'edit';

    // 2. Load constants safely
    if (TRADE_LABELS) {
      this.trades = Object.entries(TRADE_LABELS) as [TradeType, string][];
    }

    // 2. Build Form
    this.form = this.fb.group({
      name: [
        this.data.group?.name ?? '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      description: [
        this.data.group?.description ?? '',
        [Validators.maxLength(500)],
      ],
      trade: [this.data.group?.trade ?? '', Validators.required],
    });
  }

  ngOnInit(): void {
    this.store
      .select(WorkerGroupSelectors.selectActionLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.submitting = loading;
        this.cdr.detectChanges();
      });

    this.store
      .select(WorkerSelectors.selectAllWorkers)
      .pipe(takeUntil(this.destroy$))
      .subscribe((workers) => {
        this.allWorkers = workers || [];
        this.cdr.detectChanges();
      });

    // Load workers only on create mode
    if (!this.isEdit) {
      this.store.dispatch(WorkerActions.loadWorkers({ page: 1, limit: 200 }));
    }

    // Debounce member search input
    this.memberSearchControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((val) => {
        this.memberSearchTerm = val ?? '';
        this.cdr.detectChanges();
      });

    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Member picker helpers ────────────────────────────────────────────────

  getFilteredWorkers(): Worker[] {
    const term = (this.memberSearchTerm || '').trim().toLowerCase();

    return this.allWorkers.filter((w) => {
      if (!w) return false;

      const fn = (w.firstName || '').toLowerCase();
      const ln = (w.lastName || '').toLowerCase();
      const rl = (w.role || '').toLowerCase();
      const pt = (w.professionalTitle || '').toLowerCase();

      if (!term) return true;

      return (
        fn.includes(term) ||
        ln.includes(term) ||
        rl.includes(term) ||
        pt.includes(term)
      );
    });
  }

  toggleWorker(workerId: string): void {
    const next = new Set(this.selectedWorkerIds);
    if (next.has(workerId)) {
      next.delete(workerId);
    } else {
      next.add(workerId);
    }
    this.selectedWorkerIds = next;
    this.cdr.markForCheck();
  }

  isWorkerSelected(workerId: string): boolean {
    return this.selectedWorkerIds.has(workerId);
  }

  getInitials(firstName: string, lastName?: string): string {
    const f = (firstName || '').charAt(0);
    const l = (lastName || '').charAt(0);
    return (f + l).toUpperCase() || '?';
  }

  // ─── Validation helpers ───────────────────────────────────────────────────

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) return '';
    if (control.errors['required'])
      return `${this.fieldLabel(field)} is required`;
    if (control.errors['minlength'])
      return `${this.fieldLabel(field)} is too short`;
    if (control.errors['maxlength'])
      return `${this.fieldLabel(field)} is too long`;
    return 'Invalid value';
  }

  private fieldLabel(field: string): string {
    const map: Record<string, string> = {
      name: 'Group name',
      description: 'Description',
      trade: 'Trade type',
    };
    return map[field] ?? field;
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const { name, description, trade } = this.form.value;

    if (this.isEdit && this.data.group) {
      this.store.dispatch(
        WorkerGroupActions.updateGroup({
          id: this.data.group.id,
          dto: { name, description, trade: trade as TradeType },
        }),
      );
    } else {
      this.store.dispatch(
        WorkerGroupActions.createGroup({
          dto: {
            name,
            description,
            trade: trade as TradeType,
            workerIds: Array.from(this.selectedWorkerIds),
          },
        }),
      );
    }

    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
