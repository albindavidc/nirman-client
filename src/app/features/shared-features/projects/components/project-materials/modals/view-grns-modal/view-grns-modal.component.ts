import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialService } from '../../../../services/material.service';
import { GrnResponseDto } from '../../../../../../../shared/models/grn.model';
import { NotificationService } from '../../../../../../../core/services/notification.service';
import { PurchaseOrderResponseDto } from '../../../../../../../shared/models/purchase-order.model';
import { ApiError } from '../../../../../../../shared/models/api.models';

@Component({
  selector: 'app-view-grns-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './view-grns-modal.component.html',
  styleUrls: ['./view-grns-modal.component.scss'],
})
export class ViewGrnsModalComponent implements OnInit {
  private readonly materialService = inject(MaterialService);
  private readonly notificationService = inject(NotificationService);
  public readonly data = inject<{ po: PurchaseOrderResponseDto; projectId: string }>(MAT_DIALOG_DATA);

  grns: GrnResponseDto[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadGrns();
  }

  loadGrns(): void {
    this.materialService
      .getPoGoodsReceipts(this.data.projectId, this.data.po.id)
      .subscribe({
        next: (res) => {
          this.grns = res as GrnResponseDto[];
          this.isLoading = false;
        },
        error: (err: ApiError) => {
          this.notificationService.error('Failed to load receipt history');
          this.isLoading = false;
          console.error(err);
        },
      });
  }

  getMaterialName(materialId: string): string {
    const item = this.data.po.items.find((i) => i.materialId === materialId);
    return item?.materialName || 'Material';
  }
}
