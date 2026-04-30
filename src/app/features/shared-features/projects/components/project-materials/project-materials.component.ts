import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import {
  map,
  startWith,
  switchMap,
  take,
  tap,
  shareReplay,
} from 'rxjs/operators';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {
  Material,
  MaterialTransaction,
  MaterialRequest,
  MaterialRequestItem,
} from '../../models/material.model';
import { Project } from '../../models/project.models';
import { MaterialService } from '../../services/material.service';
import { ProjectService } from '../../services/project.service';
import { MaterialModalComponent } from './modals/material-modal/material-modal.component';
import { RequestMaterialModalComponent } from './modals/request-material-modal/request-material-modal.component';
import { UpdateStockModalComponent } from './modals/update-stock-modal/update-stock-modal.component';
import { ProjectPurchaseOrdersComponent } from './purchase-orders/project-purchase-orders.component';

@Component({
  selector: 'app-project-materials',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatTooltipModule,
    MatDialogModule,
    ProjectPurchaseOrdersComponent,
  ],
  host: {
    class: 'materials-container-host',
  },
  templateUrl: './project-materials.component.html',
  styleUrl: './project-materials.component.scss',
})
export class ProjectMaterialsComponent implements OnInit {
  private readonly materialService = inject(MaterialService);
  private readonly projectService = inject(ProjectService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  currentUserRole = '';
  // toggle visibility for the export report action
  showExportButton = false;

  get canAddMaterial(): boolean {
    return ['supervisor'].includes(this.currentUserRole);
  }

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.currentUserRole = user.role?.toLowerCase() || '';
    }
  }

  today = new Date();
  searchControl = new FormControl('');

  currentFilter: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'pending' =
    'all';
  expandedElement: Material | null = null;
  displayedColumns: string[] = [
    'material',
    'required',
    'received',
    'used',
    'remaining',
    'status',
    'actions',
  ];
  requestColumns: string[] = [
    'requestNumber',
    'material',
    'quantity',
    'requiredBy',
    'status',
  ];

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalMaterials = 0;

  private refresh$ = new BehaviorSubject<void>(undefined);
  currentTransactions$ = new BehaviorSubject<MaterialTransaction[]>([]);

  deliveries$ = this.currentTransactions$.pipe(
    map((txs) => txs.filter((t) => t.type === 'IN').slice(0, 5)),
  );

  usage$ = this.currentTransactions$.pipe(
    map((txs) => txs.filter((t) => t.type === 'OUT').slice(0, 5)),
  );

  project$: Observable<Project | undefined> = this.route.parent!.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) =>
      id ? this.projectService.getProjectById(id) : of(undefined),
    ),
    shareReplay(1),
  );

  materials$: Observable<Material[]> = combineLatest([
    this.route.parent!.paramMap,
    this.refresh$,
  ]).pipe(
    map(([params]) => params.get('id')),
    switchMap((id) =>
      id ? this.materialService.getProjectMaterials(id) : of([]),
    ),
    shareReplay(1),
  );

  projectRequests$: Observable<MaterialRequest[]> = combineLatest([
    this.route.parent!.paramMap,
    this.refresh$,
  ]).pipe(
    map(([params]) => params.get('id')),
    switchMap((id) =>
      id ? this.materialService.getProjectRequests(id) : of([]),
    ),
    shareReplay(1),
  );

  flattenedRequests$ = this.projectRequests$.pipe(
    map((requests) =>
      requests.flatMap((req) =>
        req.items.map((item) => ({
          ...item,
          requestNumber: req.requestNumber,
          requiredDate: req.requiredDate,
          status: req.status,
          priority: req.priority,
        })),
      ),
    ),
  );

  filteredMaterials$: Observable<Material[]> = combineLatest([
    this.materials$.pipe(startWith([])),
    this.projectRequests$.pipe(startWith([])),
    this.searchControl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([materials, requests, search]) => {
      const searchStr = (search || '').toLowerCase();

      // Enrich materials with request status
      const enriched = materials.map((m: Material) => {
        const hasActiveRequest = (requests || []).some(
          (r: MaterialRequest) =>
            (r.status === 'pending' || r.status === 'approved') &&
            r.items?.some(
              (item: MaterialRequestItem) => item.materialId === m.id,
            ),
        );
        return {
          ...m,
          status: hasActiveRequest ? 'requested' : m.status,
        };
      });

      let filtered = enriched;
      if (this.currentFilter !== 'all') {
        filtered = filtered.filter(
          (m: Material & { status: string }) =>
            m.status === this.currentFilter ||
            (this.currentFilter === 'pending' && m.status === 'requested'),
        );
      }
      if (searchStr) {
        filtered = filtered.filter(
          (m: Material & { status: string }) =>
            (m.name || '').toLowerCase().includes(searchStr) ||
            (m.code || '').toLowerCase().includes(searchStr) ||
            (m.category || '').toLowerCase().includes(searchStr),
        );
      }
      return filtered;
    }),
  );

  stats$ = combineLatest([this.materials$, this.projectRequests$]).pipe(
    map(([materials, requests]) => {
      // Active requests include both those awaiting approval and those already approved but not yet fulfilled
      return {
        lowStock: materials.filter((m) => m.status === 'low_stock').length,
        criticalStock: materials.filter((m) => m.status === 'out_of_stock')
          .length,
        pendingRequests: (requests || []).filter((r) => r.status === 'pending')
          .length,
        approvedRequests: (requests || []).filter((r) => r.status === 'approved')
          .length,
      };
    }),
  );

  totalValue$ = this.materials$.pipe(
    map((materials) =>
      materials.reduce(
        (sum, m) => sum + m.currentStock * (m.unitPrice || 0),
        0,
      ),
    ),
  );

  setFilter(
    filter: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'pending',
  ) {
    this.currentFilter = filter;
    this.searchControl.setValue(this.searchControl.value);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'in_stock':
        return 'sufficient';
      case 'low_stock':
        return 'low';
      case 'out_of_stock':
        return 'critical';
      case 'requested':
        return 'pending';
      default:
        return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'in_stock':
        return 'check_circle';
      case 'low_stock':
        return 'warning';
      case 'out_of_stock':
        return 'error';
      case 'requested':
        return 'history';
      default:
        return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'in_stock':
        return 'Sufficient';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Critical';
      case 'requested':
        return 'Requested';
      default:
        return status;
    }
  }

  getStockPercentage(element: Material): number {
    const total = element.reorderLevel || 100;
    return Math.min((element.currentStock / total) * 100, 100);
  }

  getProgressClass(element: Material): string {
    const pct = this.getStockPercentage(element);
    if (pct > 50) return 'good';
    if (pct > 25) return 'warning';
    return 'critical';
  }

  toggleRow(element: Material) {
    if (this.expandedElement === element) {
      this.expandedElement = null;
      this.currentTransactions$.next([]);
    } else {
      this.expandedElement = element;
      this.materialService
        .getTransactions(element.id)
        .pipe(tap((txs) => console.log('Transactions fetched:', txs)))
        .subscribe((txs) => {
          this.currentTransactions$.next(txs);
        });
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.searchControl.setValue(this.searchControl.value);
  }

  openAddModal() {
    const dialogRef = this.dialog.open(MaterialModalComponent, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'glass-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const projectId = this.route.parent!.snapshot.paramMap.get('id');
        if (projectId) {
          this.materialService
            .createMaterial(projectId, result)
            .subscribe(() => {
              this.refresh$.next();
            });
        }
      }
    });
  }

  openEditModal(material: Material) {
    const dialogRef = this.dialog.open(MaterialModalComponent, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'glass-dialog',
      data: { material },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.materialService
          .updateMaterial(material.id, result)
          .subscribe(() => {
            this.refresh$.next();
          });
      }
    });
  }

  deleteMaterial(material: Material) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Material',
        message: `Are you sure you want to delete ${material.name}? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn',
        icon: 'warning',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.materialService.deleteMaterial(material.id).subscribe(() => {
          this.refresh$.next();
        });
      }
    });
  }

  openUpdateStockModal(material: Material) {
    const dialogRef = this.dialog.open(UpdateStockModalComponent, {
      width: '520px',
      panelClass: 'glass-dialog',
      data: { material },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.materialService.updateStock(material.id, result).subscribe(() => {
          this.refresh$.next();
        });
      }
    });
  }

  openRequestModal() {
    combineLatest([this.materials$, this.projectRequests$])
      .pipe(take(1))
      .subscribe(([materials, requests]) => {
        const dialogRef = this.dialog.open(RequestMaterialModalComponent, {
          width: '720px',
          maxWidth: '95vw',
          panelClass: 'glass-dialog',
          data: {
            materials,
            requests,
            projectId: this.route.parent!.snapshot.paramMap.get('id'),
          },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            const projectId = this.route.parent!.snapshot.paramMap.get('id');
            if (projectId) {
              const requestDto = {
                projectId,
                priority: result.priority,
                deliveryLocation: result.deliveryLocation || undefined,
                deliveryLatitude: result.deliveryLatitude || undefined,
                deliveryLongitude: result.deliveryLongitude || undefined,
                requiredDate: result.requiredDate,
                items: [
                  {
                    materialId: result.materialId,
                    quantityRequested: result.quantityRequested,
                    unit: result.unit,
                    purpose: result.purpose,
                  },
                ],
              };

              this.materialService.createRequest(requestDto).subscribe({
                next: () => {
                  // Success - could add a notification here
                  this.refresh$.next();
                },
                error: (err) =>
                  console.error('Failed to create material request:', err),
              });
            }
          }
        });
      });
  }
}
