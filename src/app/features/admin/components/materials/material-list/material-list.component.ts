import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule, Sort } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MasterMaterialService } from '../../../services/master-material.service';
import { MaterialApprovalService } from '../../../services/material-approval.service';
import { MaterialRequestStatus } from '../../../../../shared/models/material-request.model';
import { MasterMaterial } from '../../../models/master-material.model';
import { MaterialModalComponent } from '../material-modal/material-modal.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { debounceTime, distinctUntilChanged, Subject, map } from 'rxjs';
import { Router } from '@angular/router';

export interface FlattenedRequestItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity_requested: number;
  unit: string;
  projectId: string;
  projectName: string;
  requiredDate: string;
  status: string;
  requestNumber: string;
  purpose?: string;
}

@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    MatTooltipModule,
    MatTabsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatSortModule,
    FormsModule,
  ],
  templateUrl: './material-list.component.html',
  styleUrls: ['./material-list.component.scss'],
})
export class MaterialListComponent implements OnInit {
  private readonly materialService = inject(MasterMaterialService);
  private readonly approvalService = inject(MaterialApprovalService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  materials = signal<MasterMaterial[]>([]);
  filteredMaterials = signal<MasterMaterial[]>([]);
  requestedMaterials = signal<FlattenedRequestItem[]>([]);
  searchQuery = signal('');
  selectedCategory = signal('All');
  selectedUnit = signal('All');
  viewMode = signal<'grid' | 'list'>('list');
  isMobile = signal(false);
  isLoading = signal(false);

  private searchSubject = new Subject<string>();

  // KPI Signals
  totalMaterials = computed(() => this.materials().length);
  categoriesCount = computed(() => new Set(this.materials().map(m => m.category)).size);
  
  uniqueCategories = computed(() => {
    const cats = new Set(this.materials().map(m => m.category));
    return ['All', ...Array.from(cats)].sort();
  });

  uniqueUnits = computed(() => {
    const units = new Set(this.materials().map(m => m.unit));
    return ['All', ...Array.from(units)].sort();
  });

  displayedColumns: string[] = ['code', 'name', 'category', 'unit', 'actions'];
  requestColumns: string[] = ['project', 'material', 'quantity', 'requiredBy', 'status', 'actions'];

  ngOnInit(): void {
    this.loadMaterials();
    this.loadRequestedMaterials();

    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile.set(result.matches);
        if (result.matches) {
          this.viewMode.set('grid'); // Default to grid/card view on mobile
        }
      });

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((val) => {
        this.searchQuery.set(val);
        this.filterMaterials();
      });
  }

  loadMaterials(): void {
    this.isLoading.set(true);
    this.materialService.getAll().subscribe({
      next: (data) => {
        this.materials.set(data);
        this.filterMaterials();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.error('Failed to load materials');
        this.isLoading.set(false);
        console.error(err);
      },
    });
  }

  loadRequestedMaterials(): void {
    this.approvalService.getApprovals({ status: MaterialRequestStatus.PENDING, page: 1, limit: 100 }).subscribe({
      next: (res) => {
        const flattened = res.data.flatMap(request => 
          request.items.map(item => ({
            id: item.id,
            materialId: item.material_id,
            materialName: item.material_name,
            quantity_requested: item.quantity_requested,
            unit: item.unit,
            projectId: request.project_id,
            projectName: request.project_name,
            requiredDate: request.required_date,
            status: request.status,
            requestNumber: request.request_number,
            purpose: item.purpose
          }))
        );
        this.requestedMaterials.set(flattened);
      }
    });
  }

  onSearchChange(val: string): void {
    this.searchSubject.next(val);
  }

  onCategoryChange(val: string): void {
    this.selectedCategory.set(val);
    this.filterMaterials();
  }

  onUnitChange(val: string): void {
    this.selectedUnit.set(val);
    this.filterMaterials();
  }

  filterMaterials(): void {
    let filtered = this.materials();

    // Search query filter
    const q = this.searchQuery().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (this.selectedCategory() !== 'All') {
      filtered = filtered.filter(m => m.category === this.selectedCategory());
    }

    // Unit filter
    if (this.selectedUnit() !== 'All') {
      filtered = filtered.filter(m => m.unit === this.selectedUnit());
    }

    this.filteredMaterials.set(filtered);
  }

  sortMaterials(sort: Sort): void {
    const data = this.filteredMaterials().slice();
    if (!sort.active || sort.direction === '') {
      this.filteredMaterials.set(data);
      return;
    }

    const sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'code': return compare(a.code, b.code, isAsc);
        case 'name': return compare(a.name, b.name, isAsc);
        case 'category': return compare(a.category, b.category, isAsc);
        case 'unit': return compare(a.unit, b.unit, isAsc);
        default: return 0;
      }
    });
    this.filteredMaterials.set(sortedData);
  }

  toggleViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  openMaterialModal(material?: MasterMaterial): void {
    const dialogRef = this.dialog.open(MaterialModalComponent, {
      width: '600px',
      data: { material },
      panelClass: 'glass-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadMaterials();
      }
    });
  }

  deleteMaterial(material: MasterMaterial): void {
    if (confirm(`Are you sure you want to delete material ${material.name}?`)) {
      this.materialService.delete(material.id).subscribe({
        next: () => {
          this.notificationService.success('Material deleted successfully');
          this.loadMaterials();
        },
        error: (err) => {
          this.notificationService.error('Failed to delete material');
          console.error(err);
        },
      });
    }
  }
  
  navigateToApproval(): void {
    this.router.navigate(['/admin/material-approvals']);
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
