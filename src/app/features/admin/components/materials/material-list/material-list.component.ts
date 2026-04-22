import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MasterMaterialService } from '../../../services/master-material.service';
import { MasterMaterial } from '../../../models/master-material.model';
import { MaterialModalComponent } from '../material-modal/material-modal.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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
    FormsModule,
  ],
  templateUrl: './material-list.component.html',
  styleUrls: ['./material-list.component.scss'],
})
export class MaterialListComponent implements OnInit {
  private readonly materialService = inject(MasterMaterialService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  materials = signal<MasterMaterial[]>([]);
  filteredMaterials = signal<MasterMaterial[]>([]);
  searchQuery = '';
  private searchSubject = new Subject<string>();

  displayedColumns: string[] = ['code', 'name', 'category', 'unit', 'actions'];

  ngOnInit(): void {
    this.loadMaterials();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.filterMaterials());
  }

  loadMaterials(): void {
    this.materialService.getAll().subscribe({
      next: (data) => {
        this.materials.set(data);
        this.filterMaterials();
      },
      error: (err) => {
        this.notificationService.error('Failed to load materials');
        console.error(err);
      },
    });
  }

  onSearchChange(val: string): void {
    this.searchSubject.next(val);
  }

  filterMaterials(): void {
    if (!this.searchQuery) {
      this.filteredMaterials.set(this.materials());
      return;
    }

    const q = this.searchQuery.toLowerCase();
    const filtered = this.materials().filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
    this.filteredMaterials.set(filtered);
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
}
