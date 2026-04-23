import { Component, inject, signal, computed } from '@angular/core';
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { MaterialApprovalService } from '../../../services/material-approval.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { MaterialRequestResponseDto } from '../../../../../shared/models/material-request.model';
import { Vendor } from '../../../../vendor/models/vendor.models';
import { switchMap } from 'rxjs';

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
    MatAutocompleteModule,
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
  selectedVendorId = '';
  submitting = signal(false);
  vendorSearchTerm = signal('');

  filteredVendors = computed(() => {
    const term = this.vendorSearchTerm();
    const normalizedTerm = typeof term === 'string' ? term.toLowerCase().trim() : '';
    
    if (!normalizedTerm) return [];
    
    return this.data.vendors.filter(
      (v) =>
        v.companyName.toLowerCase().includes(normalizedTerm) ||
        (v.vendorCode?.toLowerCase().includes(normalizedTerm) ?? false),
    );
  });

  displayVendor(vendor: any): string {
    return vendor?.companyName || '';
  }

  onVendorSelected(event: any): void {
    const vendor = event.option.value;
    this.selectedVendorId = vendor.id;
  }

  clearVendor(): void {
    this.vendorSearchTerm.set('');
    this.selectedVendorId = '';
  }

  public data = inject<{
    request: MaterialRequestResponseDto;
    vendors: Vendor[];
  }>(MAT_DIALOG_DATA);

  onApprove(): void {
    this.submitting.set(true);
    this.approvalService
      .approveRequest(this.data.request.id, this.comments, this.selectedVendorId)
      .subscribe({
        next: () => {
          this.notificationService.success(
            'Material request approved and Purchase Order created',
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
