import { Component, inject, OnInit } from '@angular/core';
import {
  CommonModule,
  UpperCasePipe,
  TitleCasePipe,
  AsyncPipe,
} from '@angular/common';
import { Store } from '@ngrx/store';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageEvent } from '@angular/material/paginator';
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
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../shared/components/table/table.models';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  ReasonDialogComponent,
  ReasonDialogData,
} from '../../../../shared/components/reason-dialog/reason-dialog.component';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSelectModule,
    ReactiveFormsModule,
    TableComponent,
    UpperCasePipe,
    TitleCasePipe,
    AsyncPipe,
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
  statusFilter = new FormControl('');

  columns: TableColumn[] = [
    { key: 'vendor', header: 'Vendor', type: 'template' },
    { key: 'contact', header: 'Contact', type: 'template' },
    { key: 'category', header: 'Category', type: 'template' },
    { key: 'status', header: 'Status', type: 'template' },
    { key: 'actions', header: 'Actions', type: 'template', sortable: false },
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

    this.statusFilter.valueChanges.subscribe(() => {
      this.loadData(0); // Reset to first page on filter change
    });
  }

  onSearchChange(searchValue: any) {
    // let search = searchValue.
  }

  loadData(pageIndex = 0, pageSize = this.pageSize): void {
    const filters: any = { page: pageIndex + 1, limit: pageSize };
    if (this.statusFilter.value) {
      filters.status = this.statusFilter.value;
    }

    this.store.dispatch(
      VendorActions.loadVendors({
        filters,
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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Approve Vendor',
        message: `Are you sure you want to approve ${vendor.companyName}?`,
        confirmButtonText: 'Approve',
        confirmButtonColor: 'primary',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(VendorActions.approveVendor({ id: vendor.id }));
      }
    });
  }

  rejectVendor(vendor: Vendor): void {
    const dialogRef = this.dialog.open(ReasonDialogComponent, {
      width: '450px',
      data: {
        title: 'Reject Vendor',
        message: `Please provide a reason for rejecting ${vendor.companyName}.`,
        confirmButtonText: 'Reject Vendor',
      } as ReasonDialogData,
      panelClass: 'dark-dialog',
    });

    dialogRef.afterClosed().subscribe((reason) => {
      if (reason) {
        this.store.dispatch(
          VendorActions.rejectVendor({ id: vendor.id, reason })
        );
      }
    });
  }

  blacklistVendor(vendor: Vendor): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Blacklist Vendor',
        message: `Are you sure you want to blacklist ${vendor.companyName}? This action is serious.`,
        confirmButtonText: 'Blacklist',
        confirmButtonColor: 'warn',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(VendorActions.blacklistVendor({ id: vendor.id }));
      }
    });
  }

  unblacklistVendor(vendor: Vendor): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Unblacklist Vendor',
        message: `Are you sure you want to unblacklist ${vendor.companyName}? They will become Approved.`,
        confirmButtonText: 'Unblacklist',
        confirmButtonColor: 'primary',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(VendorActions.unblacklistVendor({ id: vendor.id }));
      }
    });
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
