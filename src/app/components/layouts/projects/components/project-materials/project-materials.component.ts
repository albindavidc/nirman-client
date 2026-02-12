import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, startWith, tap, take } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MaterialService } from '../../services/material.service';
import { Material, MaterialTransaction } from '../../models/material.model';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.models';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AddMaterialModalComponent } from './modals/add-material-modal.component';
import { EditMaterialModalComponent } from './modals/edit-material-modal.component';
import { UpdateStockModalComponent } from './modals/update-stock-modal.component';
import { RequestMaterialModalComponent } from './modals/request-material-modal.component';

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

  currentUserRole: string = '';

  get canAddMaterial(): boolean {
    return ['admin', 'project_manager'].includes(this.currentUserRole);
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
    switchMap((id) => (id ? this.projectService.getProjectById(id) : [])),
  );

  materials$: Observable<Material[]> = combineLatest([
    this.route.parent!.paramMap,
    this.refresh$,
  ]).pipe(
    map(([params]) => params.get('id')),
    switchMap((id) => (id ? this.materialService.getProjectMaterials(id) : [])),
  );

  filteredMaterials$: Observable<Material[]> = combineLatest([
    this.materials$,
    this.searchControl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([materials, search]) => {
      let filtered = materials;
      if (this.currentFilter !== 'all') {
        filtered = filtered.filter((m) => m.status === this.currentFilter);
      }
      if (search) {
        const term = search.toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.name.toLowerCase().includes(term) ||
            m.code.toLowerCase().includes(term) ||
            m.category.toLowerCase().includes(term),
        );
      }
      return filtered;
    }),
  );

  stats$ = this.materials$.pipe(
    map((materials) => ({
      sufficientStock: materials.filter((m) => m.status === 'in_stock').length,
      lowStock: materials.filter((m) => m.status === 'low_stock').length,
      criticalStock: materials.filter((m) => m.status === 'out_of_stock')
        .length,
      pendingDelivery: 0,
    })),
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
    const dialogRef = this.dialog.open(AddMaterialModalComponent, {
      width: '600px',
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
    const dialogRef = this.dialog.open(EditMaterialModalComponent, {
      width: '600px',
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
    // Get current materials synchronously for the dialog
    this.materials$.pipe(take(1)).subscribe((materials) => {
      const dialogRef = this.dialog.open(RequestMaterialModalComponent, {
        width: '600px',
        data: { materials },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.materialService.createRequest(result).subscribe(() => {
            // Ideally show success message
          });
        }
      });
    });
  }
}
