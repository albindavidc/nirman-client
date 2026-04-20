import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MaterialService } from '../../../../../features/shared-features/projects/services/material.service';
import { InvoiceResponseDto } from '../../../../../shared/models/invoice.model';
import { NotificationService } from '../../../../../core/services/notification.service';
import { StripePaymentDialogComponent } from '../stripe-payment-dialog/stripe-payment-dialog.component';

@Component({
  selector: 'app-admin-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatDividerModule,
    MatChipsModule,
    MatDialogModule,
  ],
  templateUrl: './admin-invoice-detail.component.html',
  styleUrl: './admin-invoice-detail.component.scss'
})
export class AdminInvoiceDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly materialService = inject(MaterialService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  invoice = signal<InvoiceResponseDto | null>(null);
  itemColumns: string[] = ['material', 'quantity', 'price', 'tax', 'total'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadInvoice(id);

      // check for quick pay trigger
      this.route.queryParams.subscribe(params => {
        if (params['pay'] === 'true') {
           setTimeout(() => this.openPaymentDialog(), 500);
        }
      });
    }
  }

  loadInvoice(id: string): void {
    this.materialService.getInvoiceById(id).subscribe({
      next: (res) => this.invoice.set(res),
      error: () => this.notificationService.error('Failed to load invoice details')
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid': return 'primary';
      case 'pending': return 'accent';
      case 'partially_paid': return 'warn';
      default: return '';
    }
  }

  canPay(status: string): boolean {
    const s = status.toLowerCase();
    return s === 'pending' || s === 'partially_paid';
  }

  openPaymentDialog(): void {
    const inv = this.invoice();
    if (!inv) return;

    const dialogRef = this.dialog.open(StripePaymentDialogComponent, {
      width: '500px',
      data: { 
        invoiceId: inv.id,
        amount: inv.total,
        currency: inv.currency,
        invoiceNumber: inv.invoiceNumber
      },
      panelClass: 'stripe-dialog-container',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadInvoice(inv.id);
      }
    });
  }
}
