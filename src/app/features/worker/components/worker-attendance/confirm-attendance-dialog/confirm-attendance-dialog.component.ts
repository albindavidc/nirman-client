import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmAttendanceDialogData {
  type: 'in' | 'out';
  time: string;
  location: string;
}

@Component({
  selector: 'app-confirm-attendance-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-attendance-dialog.component.html',
  styleUrl: './confirm-attendance-dialog.component.scss',
})
export class ConfirmAttendanceDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmAttendanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmAttendanceDialogData,
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
