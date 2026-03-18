import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from '../../../../../shared/validators/custom-validators';
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
import { NotificationService } from '../../../../../core/services/notification.service';

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
  private notificationService = inject(NotificationService);
  dialogRef = inject(MatDialogRef<AttendanceVerificationModalComponent>);
  data = inject<{ record: AttendanceRecord }>(MAT_DIALOG_DATA);

  record: AttendanceRecord = this.data.record;
  notesControl = new FormControl('', [
    Validators.maxLength(500),
    CustomValidators.noWhitespace(),
  ]);

  verify(isVerified: boolean) {
    if (this.notesControl.invalid) {
      this.notesControl.markAsTouched();
      return;
    }

    if (!isVerified && !this.notesControl.value?.trim()) {
      this.notesControl.setErrors({ required: true });
      this.notesControl.markAsTouched();
      return;
    }

    const userJson = localStorage.getItem('user');
    const supervisorId = userJson ? JSON.parse(userJson).id || '' : '';
    const notes = this.notesControl.value?.trim() || '';

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
          this.notificationService.success('Verification sent successfully');
          this.dialogRef.close(true);
        },
        error: (err: unknown) => {
          console.error('Verification failed', err);
          this.notificationService.error('Verification failed');
        },
      });
  }
}
