import { Component, inject } from '@angular/core';
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
import { SharedModalComponent } from '../../../../../shared/components/shared-modal/shared-modal.component';

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
  dialogRef = inject(MatDialogRef<AttendanceVerificationModalComponent>);
  data = inject<{ record: AttendanceRecord }>(MAT_DIALOG_DATA);

  record: AttendanceRecord = this.data.record;
  notesControl = new FormControl('');

  verify(isVerified: boolean) {
    const userJson = localStorage.getItem('user');
    const supervisorId = userJson ? JSON.parse(userJson).id || '' : '';
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
        error: (err: unknown) => {
          console.error('Verification failed', err);
          // Handle error (show toast)
        },
      });
  }
}
