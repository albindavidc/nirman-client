import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Observable, switchMap, map, shareReplay } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
  WorkerModalComponent,
  WorkerModalData,
} from '../worker-modal/worker-modal.component';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { AttendanceVerificationModalComponent } from '../attendance-verification-modal/attendance-verification-modal.component';
import { AttendanceRecord as ServiceAttendanceRecord } from '../../services/attendance.service';
import { AttendanceRecord } from '../../models/project.models';

interface AttendanceStats {
  rate: number;
  present: number;
  late: number;
  absent: number;
}

@Component({
  selector: 'app-project-workers',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatPaginatorModule,
  ],
  templateUrl: './project-workers.component.html',
  styleUrl: './project-workers.component.scss',
})
export class ProjectWorkersComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'slNo',
    'name',
    'role',
    'site',
    'checkIn',
    'checkOut',
    'hours',
    'status',
    'verified',
    'actions',
  ];

  attendance$: Observable<AttendanceRecord[]> | undefined;
  stats$: Observable<AttendanceStats> | undefined;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalRecords = 0;

  today = new Date();
  currentUserRole = '';

  get isAdmin(): boolean {
    return ['admin'].includes(this.currentUserRole);
  }

  get canAddWorker(): boolean {
    return ['admin'].includes(this.currentUserRole);
  }

  get canVerify(): boolean {
    return ['admin', 'supervisor', 'project_manager'].includes(
      this.currentUserRole,
    );
  }

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.currentUserRole = user.role?.toLowerCase() || '';
    }
    this.refreshData();
  }

  getStatusClass(status: string): string {
    const s = status.toLowerCase().replace(' ', '-').replace('_', '-');
    return s;
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#e9c16c', // gold
      '#4caf50', // green
      '#2196f3', // blue
      '#ff9800', // orange
      '#9c27b0', // purple
      '#00bcd4', // cyan
      '#e91e63', // pink
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  openAddWorkerModal(): void {
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (!projectId) return;

    const dialogRef = this.dialog.open(WorkerModalComponent, {
      width: '600px',
      data: {
        mode: 'create',
        projectId: projectId,
        projectName: 'Project',
      } as WorkerModalData,
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshData();
      }
    });
  }

  editWorker(worker: AttendanceRecord): void {
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (!projectId) return;

    const dialogRef = this.dialog.open(WorkerModalComponent, {
      width: '600px',
      data: {
        mode: 'edit',
        projectId,
        worker: {
          userId: worker.workerId,
          userName: worker.workerName,
          currentRole: worker.workerRole,
        }
      } as WorkerModalData,
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshData();
      }
    });
  }

  exportReport(): void {
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (!projectId) return;

    this.projectService.exportAttendanceReport(projectId).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report-${
        new Date().toISOString().split('T')[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }

  removeWorker(worker: AttendanceRecord): void {
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (!projectId) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Remove Worker',
        message: `Are you sure you want to remove ${worker.workerName} from this project?`,
        confirmText: 'Remove',
        confirmColor: 'warn',
        icon: 'person_remove',
      },
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.projectService
          .removeProjectWorker(projectId, worker.workerId)
          .subscribe(() => {
            this.refreshData();
          });
      }
    });
  }

  openVerificationModal(worker: AttendanceRecord): void {
    const projectId = this.route.parent?.snapshot.paramMap.get('id') || '';

    // Map from project.models AttendanceRecord to attendance.service AttendanceRecord
    const nameParts = worker.workerName.split(' ');
    const serviceRecord: ServiceAttendanceRecord = {
      id: worker.id,
      userId: worker.workerId,
      projectId: projectId,
      date: worker.date,
      checkIn: worker.checkIn,
      checkOut: worker.checkOut,
      status: worker.status,
      location: worker.location,
      workHours: worker.workHours,
      method: 'Manual',
      isVerified: false,
      user: {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        role: worker.workerRole,
      },
    };

    const dialogRef = this.dialog.open(AttendanceVerificationModalComponent, {
      width: '600px',
      data: { record: serviceRecord },
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshData();
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.refreshData();
  }

  private refreshData(): void {
    this.attendance$ = this.route.parent?.paramMap.pipe(
      map((params) => params.get('id')),
      switchMap((id) => {
        if (!id) return [];
        return this.projectService.getProjectAttendance(id);
      }),
      map((records) => {
        // Filter out admins from the listing
        const filteredRecords = records.filter(
          (r) => r.workerRole?.toLowerCase() !== 'admin',
        );
        this.totalRecords = filteredRecords.length;
        const start = this.currentPage * this.pageSize;
        return filteredRecords.slice(start, start + this.pageSize);
      }),
      shareReplay(1),
    );

    this.stats$ = this.route.parent?.paramMap.pipe(
      map((params) => params.get('id')),
      switchMap((id) => {
        if (!id) return [];
        return this.projectService.getProjectAttendance(id);
      }),
      map((records) => {
        // Filter out admins from the stats
        const filteredRecords = records.filter(
          (r) => r.workerRole?.toLowerCase() !== 'admin',
        );
        const total = filteredRecords.length;
        if (total === 0) return { rate: 0, present: 0, late: 0, absent: 0 };

        const present = filteredRecords.filter(
          (r) => r.status === 'on_time' || r.status === 'late',
        ).length;
        const late = filteredRecords.filter((r) => r.status === 'late').length;
        const absent = filteredRecords.filter(
          (r) => r.status === 'absent' || r.status === 'on_leave',
        ).length;

        const rate = Math.round((present / total) * 100);

        return { rate, present, late, absent };
      }),
      shareReplay(1),
    );
  }
}
