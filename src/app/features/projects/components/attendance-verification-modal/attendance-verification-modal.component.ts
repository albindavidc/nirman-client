import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {
  AttendanceRecord,
  AttendanceService,
} from '../../services/attendance.service';
import { SharedModalComponent } from '../../../../shared/components/shared-modal/shared-modal.component';

@Component({
  selector: 'app-attendance-verification-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    SharedModalComponent,
  ],
  templateUrl: './attendance-verification-modal.component.html',
  styleUrls: ['./attendance-verification-modal.component.scss'],
})
export class AttendanceVerificationModalComponent {
  private attendanceService = inject(AttendanceService);
  record: AttendanceRecord;
  notesControl = new FormControl('');

  constructor(
    public dialogRef: MatDialogRef<AttendanceVerificationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { record: AttendanceRecord },
  ) {
    this.record = data.record;
  }

  verify(isVerified: boolean) {
    // Assuming supervisorId is fetched from auth service or similar in real app.
    // Making it hardcoded or passed for now.
    const supervisorId = 'current-user-id';
    const notes = this.notesControl.value || '';

    this.attendanceService
      .verifyAttendance(
        this.record.projectId,
        this.record.id,
        supervisorId,
        isVerified,
        notes,
      )
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err: any) => {
          console.error('Verification failed', err);
          // Handle error (show toast)
        },
      });
  }
}
