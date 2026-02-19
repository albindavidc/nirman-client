import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  AttendanceService,
  AttendanceRecord,
  AttendanceStats,
} from '../../services/attendance.service';
import { AttendanceVerificationModalComponent } from '../attendance-verification-modal/attendance-verification-modal.component';

@Component({
  selector: 'app-project-attendance',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
  ],
  templateUrl: './project-attendance.component.html',
  styleUrls: ['./project-attendance.component.scss'],
})
export class ProjectAttendanceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private attendanceService = inject(AttendanceService);
  private dialog = inject(MatDialog);

  projectId = '';
  currentDate: Date = new Date();

  stats: AttendanceStats = {
    attendanceRate: 0,
    presentToday: 0,
    lateArrivals: 0,
    absent: 0,
    hoursThisWeek: 0,
    hoursThisMonth: 0,
  };

  currentUserRole = '';

  get canVerify(): boolean {
    return ['admin', 'supervisor', 'project_manager'].includes(
      this.currentUserRole,
    );
  }

  displayedColumns: string[] = [
    'workerId',
    'name',
    'role',
    'site',
    'checkIn',
    'checkOut',
    'hours',
    'status',
    'location',
    'action',
  ];
  dataSource: AttendanceRecord[] = [];

  ngOnInit() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.currentUserRole = user.role?.toLowerCase() || '';
    }

    this.route.parent?.paramMap.subscribe((params) => {
      this.projectId = params.get('id') || '';
      if (this.projectId) {
        this.loadData();
      }
    });
  }

  loadData() {
    this.attendanceService
      .getAttendanceStats(this.projectId, this.currentDate)
      .subscribe((stats) => {
        this.stats = stats;
      });

    this.attendanceService
      .getProjectAttendance(this.projectId, this.currentDate)
      .subscribe((records) => {
        this.dataSource = records;
      });
  }

  openVerificationModal(record: AttendanceRecord) {
    const dialogRef = this.dialog.open(AttendanceVerificationModalComponent, {
      width: '600px',
      data: { record },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'present':
        return 'primary';
      case 'late':
        return 'accent';
      case 'absent':
        return 'warn';
      case 'verified':
        return 'primary'; // Custom style needed for verified
      default:
        return 'default';
    }
  }
}
