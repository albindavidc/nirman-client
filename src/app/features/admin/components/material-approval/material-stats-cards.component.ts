import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MaterialApprovalStatsDto } from '../../../../shared/models/material-request.model';

@Component({
  selector: 'app-material-stats-cards',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="icon-box info">
          <mat-icon>description</mat-icon>
        </div>
        <div class="stat-content">
          <span class="value">{{ stats.totalRequests }}</span>
          <span class="label">Total Requests</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="icon-box warning">
          <mat-icon>schedule</mat-icon>
        </div>
        <div class="stat-content">
          <span class="value">{{ stats.pendingReview }}</span>
          <span class="label">Pending Review</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="icon-box success">
          <mat-icon>check_circle</mat-icon>
        </div>
        <div class="stat-content">
          <span class="value">{{ stats.approved }}</span>
          <span class="label">Approved</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="icon-box secondary">
          <mat-icon>inventory_2</mat-icon>
        </div>
        <div class="stat-content">
          <span class="value">{{ stats.inProgress }}</span>
          <span class="label">In Progress</span>
        </div>
      </div>

      <div class="stat-card highlight">
        <div class="icon-box primary">
          <mat-icon>trending_up</mat-icon>
        </div>
        <div class="stat-content">
          <span class="value">{{ stats.totalValue | currency:'USD':'symbol':'1.0-0' }}</span>
          <span class="label">Total Value</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 20px;
    }

    .stat-card {
      background: var(--md-sys-color-surface-container);
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        border-color: var(--md-sys-color-outline);
        background: var(--md-sys-color-surface-container-high);
      }

      &.highlight {
        background: rgba(233, 193, 108, 0.05);
        border-color: rgba(233, 193, 108, 0.2);
      }
    }

    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      &.info { background: rgba(139, 208, 239, 0.1); color: var(--md-sys-color-secondary); }
      &.warning { background: rgba(255, 183, 134, 0.1); color: #ffb786; }
      &.success { background: rgba(161, 211, 154, 0.1); color: var(--md-sys-color-tertiary); }
      &.secondary { background: rgba(139, 208, 239, 0.1); color: var(--md-sys-color-secondary); }
      &.primary { background: rgba(233, 193, 108, 0.1); color: var(--md-sys-color-primary); }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      
      .value {
        font-size: 1.5rem;
        font-weight: 500;
        color: var(--md-sys-color-on-surface);
      }

      .label {
        font-size: 0.85rem;
        color: var(--md-sys-color-on-surface-variant);
        white-space: nowrap;
      }
    }

    @media (max-width: 1200px) {
      .stats-grid { grid-template-columns: repeat(3, 1fr); }
    }

    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class MaterialStatsCardsComponent {
  @Input() stats!: MaterialApprovalStatsDto;
}
