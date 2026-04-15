import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MaterialApprovalService } from '../../services/material-approval.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MaterialRequestResponseDto, MaterialRequestStatus } from '../../../../shared/models/material-request.model';

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
    FormsModule
  ],
  template: `
    <div class="dialog-container">
      <header class="dialog-header">
        <div class="title-area">
          <mat-icon class="header-icon">description</mat-icon>
          <div>
            <h2>Request Detail: {{ data.request.request_number }}</h2>
            <p class="subtitle">{{ data.request.project_name }} • {{ data.request.requested_by_name }}</p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close><mat-icon>close</mat-icon></button>
      </header>

      <mat-dialog-content>
        <div class="content-grid">
          <div class="items-section">
            <h3 class="section-title">Requested Materials</h3>
            <div class="items-table">
              <div class="table-header">
                <span>Material</span>
                <span>Code</span>
                <span>Quantity</span>
                <span>Unit</span>
              </div>
              <div class="table-body">
                @for (item of data.request.items; track item.id) {
                  <div class="table-row">
                    <span class="m-name">{{ item.material_name }}</span>
                    <span class="m-code">{{ item.material_code }}</span>
                    <span class="m-qty">{{ item.quantity_requested }}</span>
                    <span class="m-unit">{{ item.unit }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="actions-section">
            <h3 class="section-title">Approval Actions</h3>
            
            @if (data.request.status === 'pending') {
              <div class="action-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Approval Comments / Rejection Reason</mat-label>
                  <textarea 
                    matInput 
                    placeholder="Enter your comments or reason..." 
                    [(ngModel)]="comments"
                    rows="4"
                  ></textarea>
                </mat-form-field>

                <div class="button-row">
                  <button 
                    mat-flat-button 
                    color="warn" 
                    [disabled]="submitting() || !comments.trim()"
                    (click)="onReject()"
                  >
                    <mat-icon>close</mat-icon> Reject Request
                  </button>
                  <button 
                    mat-flat-button 
                    class="approve-btn"
                    [disabled]="submitting()"
                    (click)="onApprove()"
                  >
                    <mat-icon>check</mat-icon> Approve Request
                  </button>
                </div>
              </div>
            } @else {
              <div class="status-box" [class]="data.request.status">
                <mat-icon>{{ data.request.status === 'approved' ? 'check_circle' : 'cancel' }}</mat-icon>
                <div class="status-info">
                  <p class="status-label">This request has been {{ data.request.status }}</p>
                  @if (data.request.approval_comments || data.request.rejection_reason) {
                    <p class="status-comments">"{{ data.request.approval_comments || data.request.rejection_reason }}"</p>
                  }
                  <p class="status-meta">Processed on {{ (data.request.approved_at || data.request.updated_at) | date:'medium' }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .dialog-container {
      background: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface);
    }

    .dialog-header {
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);

      .title-area {
        display: flex;
        gap: 16px;
        align-items: center;

        .header-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: var(--md-sys-color-primary);
        }

        h2 { margin: 0; font-size: 1.5rem; font-weight: 500; }
        .subtitle { margin: 4px 0 0; color: var(--md-sys-color-on-surface-variant); font-size: 0.9rem; }
      }
    }

    mat-dialog-content {
      padding: 24px !important;
      max-height: 70vh;
    }

    .content-grid {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .section-title {
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--md-sys-color-outline);
      margin-bottom: 16px;
    }

    .items-table {
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 8px;
      overflow: hidden;

      .table-header {
        background: var(--md-sys-color-surface-container-high);
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        padding: 12px 16px;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--md-sys-color-on-surface-variant);
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
      }

      .table-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        padding: 12px 16px;
        font-size: 0.9rem;
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
        &:last-child { border-bottom: none; }
        
        .m-name { font-weight: 500; }
        .m-code { color: var(--md-sys-color-outline); font-family: monospace; }
      }
    }

    .action-form {
      .full-width { width: 100%; }
      .button-row {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
      }
    }

    .approve-btn {
      background: var(--md-sys-color-primary) !important;
      color: var(--md-sys-color-on-primary) !important;
      &:disabled { opacity: 0.5; }
    }

    .status-box {
      display: flex;
      gap: 16px;
      padding: 20px;
      border-radius: 12px;
      align-items: flex-start;
      
      .mat-icon { font-size: 32px; width: 32px; height: 32px; }
      
      &.approved { background: rgba(161, 211, 154, 0.1); color: var(--md-sys-color-tertiary); .status-box { border: 1px solid var(--md-sys-color-tertiary); } }
      &.rejected { background: rgba(255, 180, 171, 0.1); color: var(--md-sys-color-error); }
      
      .status-label { font-weight: 600; margin: 0 0 4px; }
      .status-comments { font-style: italic; font-size: 0.9rem; margin: 8px 0; color: var(--md-sys-color-on-surface); }
      .status-meta { font-size: 0.8rem; margin: 0; color: var(--md-sys-color-on-surface-variant); }
    }
  `]
})
export class MaterialRequestActionDialogComponent {
  private readonly approvalService = inject(MaterialApprovalService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<MaterialRequestActionDialogComponent>);

  comments = '';
  submitting = signal(false);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { request: MaterialRequestResponseDto }) {}

  onApprove(): void {
    this.submitting.set(true);
    this.approvalService.approveRequest(this.data.request.id, this.comments).subscribe({
      next: () => {
        this.notificationService.success('Material request approved successfully');
        this.dialogRef.close(true);
      },
      error: () => {
        this.notificationService.error('Failed to approve material request');
        this.submitting.set(false);
      }
    });
  }

  onReject(): void {
    if (!this.comments.trim()) {
      this.notificationService.warn('Please provide a reason for rejection');
      return;
    }

    this.submitting.set(true);
    this.approvalService.rejectRequest(this.data.request.id, this.comments).subscribe({
      next: () => {
        this.notificationService.success('Material request rejected');
        this.dialogRef.close(true);
      },
      error: () => {
        this.notificationService.error('Failed to reject material request');
        this.submitting.set(false);
      }
    });
  }
}
