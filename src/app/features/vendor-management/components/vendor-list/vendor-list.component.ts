import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
  trigger,
  transition,
  style,
  animate,
  stagger,
  query,
} from '@angular/animations';

import * as VendorActions from '../../store/vendor.actions';
import * as VendorSelectors from '../../store/vendor.selectors';
import { Vendor } from '../../models/vendor.models';
import { VendorEditModalComponent } from '../vendor-edit-modal/vendor-edit-modal.component';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatMenuModule,
    MatDialogModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatPaginatorModule,
  ],
  templateUrl: './vendor-list.component.html',
  styleUrl: './vendor-list.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        query(
          '.stat-card',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('tableRowAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-10px)' }),
        animate(
          '200ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
  ],
})
export class VendorListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);

  vendors$ = this.store.select(VendorSelectors.selectVendors);
  stats$ = this.store.select(VendorSelectors.selectStats);
  isLoading$ = this.store.select(VendorSelectors.selectIsLoading);
  error$ = this.store.select(VendorSelectors.selectError);
  total$ = this.store.select(VendorSelectors.selectTotal);

  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  displayedColumns: string[] = [
    'vendor',
    'contact',
    'category',
    'status',
    'actions',
  ];

  statCards = [
    {
      label: 'Total Vendors',
      icon: 'store',
      color: 'primary',
      getValue: (stats: any) => stats.total,
    },
    {
      label: 'Pending Approval',
      icon: 'hourglass_empty',
      color: 'warning',
      getValue: (stats: any) => stats.pending,
    },
    {
      label: 'Active Vendors',
      icon: 'check_circle',
      color: 'success',
      getValue: (stats: any) => stats.active,
    },
    {
      label: 'Rejected',
      icon: 'cancel',
      color: 'error',
      getValue: (stats: any) => stats.rejected,
    },
    {
      label: 'Blacklisted',
      icon: 'block',
      color: 'tertiary',
      getValue: (stats: any) => stats.blacklisted,
    },
  ];

  ngOnInit(): void {
    this.loadData();
    this.store.dispatch(VendorActions.loadVendorStats());
  }

  loadData(pageIndex = 0, pageSize = this.pageSize): void {
    this.store.dispatch(
      VendorActions.loadVendors({
        filters: { page: pageIndex + 1, limit: pageSize },
      })
    );
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.loadData(event.pageIndex, event.pageSize);
  }

  openVendorModal(vendor?: Vendor): void {
    this.store.dispatch(
      VendorActions.setSelectedVendor({ vendor: vendor || null })
    );
    this.dialog.open(VendorEditModalComponent, {
      width: '600px',
      panelClass: 'dark-dialog',
      data: { vendor },
    });
  }

  approveVendor(vendor: Vendor): void {
    this.store.dispatch(VendorActions.approveVendor({ id: vendor.id }));
  }

  rejectVendor(vendor: Vendor): void {
    this.store.dispatch(VendorActions.rejectVendor({ id: vendor.id }));
  }

  blacklistVendor(vendor: Vendor): void {
    this.store.dispatch(VendorActions.blacklistVendor({ id: vendor.id }));
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'check_circle';
      case 'rejected':
        return 'cancel';
      case 'pending':
        return 'hourglass_empty';
      case 'blacklisted':
        return 'block';
      default:
        return 'help_outline';
    }
  }

  getVendorCode(vendor: Vendor): string {
    return `V-${vendor.registrationNumber?.slice(-3) || '000'}`;
  }
}
