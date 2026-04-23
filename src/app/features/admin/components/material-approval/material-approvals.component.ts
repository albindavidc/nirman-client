import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MaterialApprovalService } from '../../services/material-approval.service';
import { MaterialStatsCardsComponent } from './material-stats-cards/material-stats-cards.component';
import { MaterialRequestCardComponent } from './material-request-card/material-request-card.component';
import {
  GetMaterialRequestDto,
  MaterialApprovalStatsDto,
  MaterialRequestResponseDto,
} from '../../../../shared/models/material-request.model';
import { MaterialRequestActionDialogComponent } from './material-request-dialog/material-request-dialog.component';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../auth/login/store/login.selectors';
import { Role } from '../../../../shared/models/profile.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { VendorService } from '../../../vendor/services/vendor.service';
import { Vendor } from '../../../vendor/models/vendor.models';

@Component({
  selector: 'app-material-approvals',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MaterialStatsCardsComponent,
    MaterialRequestCardComponent,
    FormsModule,
  ],
  templateUrl: './material-approvals.component.html',
  styleUrls: ['./material-approvals.component.scss'],
})
export class MaterialApprovalsComponent implements OnInit {
  private readonly approvalService = inject(MaterialApprovalService);
  private readonly vendorService = inject(VendorService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(Store);

  isAdmin = false;
  isVendor = false;

  stats = signal<MaterialApprovalStatsDto>({
    totalRequests: 0,
    pendingReview: 0,
    approved: 0,
    inProgress: 0,
    totalValue: 0,
  });

  requests = signal<MaterialRequestResponseDto[]>([]);
  filteredRequests = signal<MaterialRequestResponseDto[]>([]);
  vendors = signal<Vendor[]>([]);
  totalRequests = signal<number>(0);
  searchQuery = '';
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.checkRole();
    this.loadStats();
    this.loadRequests();
    this.loadVendors();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.filterRequests());
  }

  checkRole(): void {
    this.store
      .select(selectUser)
      .pipe(take(1))
      .subscribe((user) => {
        this.isAdmin = user?.role === Role.ADMIN;
        this.isVendor = user?.role === Role.VENDOR;
      });
  }

  loadStats(): void {
    this.approvalService.getStats().subscribe((stats) => this.stats.set(stats));
  }

  loadRequests(): void {
    const query: GetMaterialRequestDto = { page: 1, limit: 20 };
    this.approvalService.getApprovals(query).subscribe((res) => {
      this.requests.set(res.data);
      this.totalRequests.set(res.total);
      this.filterRequests();
    });
  }

  loadVendors(): void {
    this.vendorService.getVendors({ status: 'approved', limit: 100 }).subscribe((res) => {
      this.vendors.set(res.vendors);
    });
  }

  onSearchChange(val: string): void {
    this.searchSubject.next(val);
  }

  filterRequests(): void {
    if (!this.searchQuery) {
      this.filteredRequests.set(this.requests());
      return;
    }

    const q = this.searchQuery.toLowerCase();
    const filtered = this.requests().filter(
      (r) =>
        r.request_number.toLowerCase().includes(q) ||
        r.project_name.toLowerCase().includes(q) ||
        r.requested_by_name.toLowerCase().includes(q),
    );
    this.filteredRequests.set(filtered);
  }

  openRequestDetail(request: MaterialRequestResponseDto): void {
    const dialogRef = this.dialog.open(MaterialRequestActionDialogComponent, {
      width: '800px',
      data: { request, vendors: this.vendors() },
      panelClass: 'material-request-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadStats();
        this.loadRequests();
      }
    });
  }

}
