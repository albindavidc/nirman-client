import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MaterialService } from '../../../services/material.service';
import { PurchaseOrderResponseDto } from '../../../../../../shared/models/purchase-order.model';
import { NotificationService } from '../../../../../../core/services/notification.service';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../../../auth/login/store/login.selectors';
import { Role } from '../../../../../../shared/models/profile.model';
import { take } from 'rxjs';
import { AddGrnModalComponent } from '../../modals/add-grn-modal/add-grn-modal.component';
import { ViewGrnsModalComponent } from '../../modals/view-grns-modal/view-grns-modal.component';

@Component({
  selector: 'app-project-purchase-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './project-purchase-orders.component.html',
  styleUrls: ['./project-purchase-orders.component.scss'],
})
export class ProjectPurchaseOrdersComponent implements OnInit {
  @Input({ required: true }) projectId!: string;

  private readonly materialService = inject(MaterialService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(Store);

  purchaseOrders: PurchaseOrderResponseDto[] = [];
  displayedColumns: string[] = [
    'poNumber',
    'vendor',
    'date',
    'amount',
    'status',
    'actions',
  ];
  canAddGrn = false;

  ngOnInit(): void {
    this.checkUserRole();
    this.loadPurchaseOrders();
  }

  private checkUserRole(): void {
    this.store
      .select(selectUser)
      .pipe(take(1))
      .subscribe((user) => {
        this.canAddGrn = user?.role === Role.SUPERVISOR;
      });
  }

  loadPurchaseOrders(): void {
    this.materialService
      .getProjectPurchaseOrders(this.projectId)
      .subscribe({
        next: (pos) => {
          this.purchaseOrders = pos;
        },
        error: (err) => {
          this.notificationService.error('Failed to load purchase orders');
          console.error(err);
        },
      });
  }

  openAddGrnModal(po: PurchaseOrderResponseDto): void {
    const dialogRef = this.dialog.open(AddGrnModalComponent, {
      width: '900px',
      maxHeight: '90vh',
      data: { po, projectId: this.projectId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPurchaseOrders();
      }
    });
  }

  openViewGrnsModal(po: PurchaseOrderResponseDto): void {
    this.dialog.open(ViewGrnsModalComponent, {
      width: '800px',
      data: { po, projectId: this.projectId },
    });
  }
}
