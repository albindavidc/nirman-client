import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MaterialApprovalService } from '../../../services/material-approval.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import {
  MaterialRequestResponseDto,
  MaterialRequestStatus,
} from '../../../../../shared/models/material-request.model';

@Component({
  selector: 'app-material-request-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './material-request-dialog.component.html',
  styleUrls: ['./material-request-dialog.component.scss'],
})
export class MaterialRequestActionDialogComponent {
  private readonly approvalService = inject(MaterialApprovalService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(
    MatDialogRef<MaterialRequestActionDialogComponent>,
  );

  comments = '';
  submitting = signal(false);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { request: MaterialRequestResponseDto },
  ) {}

  onApprove(): void {
    this.submitting.set(true);
    this.approvalService
      .approveRequest(this.data.request.id, this.comments)
      .subscribe({
        next: () => {
          this.notificationService.success(
            'Material request approved successfully',
          );
          this.dialogRef.close(true);
        },
        error: () => {
          this.notificationService.error('Failed to approve material request');
          this.submitting.set(false);
        },
      });
  }

  onReject(): void {
    if (!this.comments.trim()) {
      this.notificationService.warn('Please provide a reason for rejection');
      return;
    }

    this.submitting.set(true);
    this.approvalService
      .rejectRequest(this.data.request.id, this.comments)
      .subscribe({
        next: () => {
          this.notificationService.success('Material request rejected');
          this.dialogRef.close(true);
        },
        error: () => {
          this.notificationService.error('Failed to reject material request');
          this.submitting.set(false);
        },
      });
  }
}
