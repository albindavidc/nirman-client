import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { MaterialService } from '../../../../../features/shared-features/projects/services/material.service';
import { InvoiceResponseDto } from '../../../../../shared/models/invoice.model';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './admin-invoice-list.component.html',
  styleUrl: './admin-invoice-list.component.scss'
})
export class AdminInvoiceListComponent implements OnInit {
  private readonly materialService = inject(MaterialService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  invoices = signal<InvoiceResponseDto[]>([]);
  displayedColumns: string[] = ['invoiceNumber', 'projectName', 'vendorName', 'total', 'dueDate', 'status', 'actions'];

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.materialService.getInvoices('all').subscribe({
      next: (res) => this.invoices.set(res),
      error: () => this.notificationService.error('Failed to load invoices')
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid': return 'primary';
      case 'pending': return 'accent';
      case 'partially_paid': return 'warn';
      case 'failed': return 'warn';
      default: return '';
    }
  }

  canPay(status: string): boolean {
    const s = status.toLowerCase();
    return s === 'pending' || s === 'partially_paid';
  }

  viewDetail(invoice: InvoiceResponseDto): void {
    this.router.navigate(['/admin/finance/invoices', invoice.id]);
  }

  payNow(invoice: InvoiceResponseDto, event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigate(['/admin/finance/invoices', invoice.id], { queryParams: { pay: true } });
  }
}
