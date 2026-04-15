import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MaterialApprovalService } from '../../services/material-approval.service';
import { MaterialStatsCardsComponent } from './material-stats-cards.component';
import { MaterialRequestCardComponent } from './material-request-card.component';
import {
  GetMaterialRequestDto,
  MaterialApprovalStatsDto,
  MaterialRequestResponseDto,
  MaterialRequestStatus,
} from '../../../../shared/models/material-request.model';
import { MaterialRequestActionDialogComponent } from './material-request-dialog.component';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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
  template: `
    <div class="approvals-container">
      <header class="page-header">
        <div class="header-content">
          <h1>Material Requests Approvals</h1>
          <p class="subtitle">Manage and approve material procurement requests</p>
        </div>
      </header>

      <app-material-stats-cards [stats]="stats()"></app-material-stats-cards>

      <div class="filter-bar">
        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input 
            type="text" 
            placeholder="Search by request number, project, or requester..." 
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
          >
        </div>
        
        <div class="actions">
          <button mat-stroked-button class="filter-btn">
            <mat-icon>filter_list</mat-icon>
            Filters
            <mat-icon iconPositionEnd>expand_more</mat-icon>
          </button>
          
          <div class="sort-group">
            <span class="sort-label">Sort by:</span>
            <button class="sort-btn active">Date <mat-icon>south</mat-icon></button>
            <button class="sort-btn">Priority</button>
            <button class="sort-btn">Cost</button>
          </div>
        </div>
      </div>

      <div class="results-info">
        Showing 1-{{ requests().length }} of {{ totalRequests() }} requests
      </div>

      <div class="request-list">
        @for (request of filteredRequests(); track request.id) {
          <app-material-request-card 
            [request]="request"
            (click)="openRequestDetail(request)"
          ></app-material-request-card>
        } @empty {
          <div class="empty-state">
            <mat-icon>inventory_2</mat-icon>
            <p>No material requests found matching your filters.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .approvals-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      color: var(--md-sys-color-on-surface);
    }

    .page-header {
      margin-bottom: 32px;
      h1 {
        font-size: 2.5rem;
        font-weight: 500;
        color: var(--md-sys-color-primary);
        margin: 0;
      }
      .subtitle {
        color: var(--md-sys-color-on-surface-variant);
        font-size: 1.1rem;
        margin: 8px 0 0;
      }
    }

    .filter-bar {
      margin-top: 32px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 24px;
      background: var(--md-sys-color-surface-container);
      padding: 12px 24px;
      border-radius: 12px;
      border: 1px solid var(--md-sys-color-outline-variant);

      .search-box {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--md-sys-color-on-surface-variant);
        
        input {
          background: transparent;
          border: none;
          color: var(--md-sys-color-on-surface);
          font-size: 1rem;
          width: 100%;
          outline: none;
          
          &::placeholder {
            color: var(--md-sys-color-outline);
          }
        }
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 32px;
      }

      .filter-btn {
        border-radius: 8px;
        color: var(--md-sys-color-on-surface);
        gap: 8px;
        padding: 0 16px;
      }

      .sort-group {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .sort-label {
          color: var(--md-sys-color-on-surface-variant);
          font-size: 0.9rem;
          margin-right: 8px;
        }

        .sort-btn {
          background: transparent;
          border: none;
          color: var(--md-sys-color-on-surface-variant);
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 6px;
          transition: all 0.2s;

          &:hover {
            background: var(--md-sys-color-surface-container-high);
          }

          &.active {
            background: rgba(233, 193, 108, 0.15);
            color: var(--md-sys-color-primary);
          }

          .mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
        }
      }
    }

    .results-info {
      margin: 24px 0 16px;
      color: var(--md-sys-color-on-surface-variant);
      font-size: 0.9rem;
    }

    .request-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .empty-state {
      text-align: center;
      padding: 64px 0;
      color: var(--md-sys-color-outline);
      
      .mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }
    }
  `]
})
export class MaterialApprovalsComponent implements OnInit {
  private readonly approvalService = inject(MaterialApprovalService);
  private readonly dialog = inject(MatDialog);

  stats = signal<MaterialApprovalStatsDto>({
    totalRequests: 0,
    pendingReview: 0,
    approved: 0,
    inProgress: 0,
    totalValue: 0,
  });

  requests = signal<MaterialRequestResponseDto[]>([]);
  filteredRequests = signal<MaterialRequestResponseDto[]>([]);
  totalRequests = signal<number>(0);
  searchQuery = '';
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadStats();
    this.loadRequests();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.filterRequests());
  }

  loadStats(): void {
    this.approvalService.getStats().subscribe(stats => this.stats.set(stats));
  }

  loadRequests(): void {
    const query: GetMaterialRequestDto = { page: 1, limit: 20 };
    this.approvalService.getApprovals(query).subscribe(res => {
      this.requests.set(res.data);
      this.totalRequests.set(res.total);
      this.filterRequests();
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
    const filtered = this.requests().filter(r => 
      r.request_number.toLowerCase().includes(q) ||
      r.project_name.toLowerCase().includes(q) ||
      r.requested_by_name.toLowerCase().includes(q)
    );
    this.filteredRequests.set(filtered);
  }

  openRequestDetail(request: MaterialRequestResponseDto): void {
    const dialogRef = this.dialog.open(MaterialRequestActionDialogComponent, {
      width: '800px',
      data: { request },
      panelClass: 'material-request-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStats();
        this.loadRequests();
      }
    });
  }
}
