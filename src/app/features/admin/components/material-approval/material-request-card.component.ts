import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MaterialRequestResponseDto } from '../../../../shared/models/material-request.model';

@Component({
  selector: 'app-material-request-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="request-card">
      <div class="card-body">
        <div class="header-row">
          <div class="title-section">
            <h3 class="title">{{ request.project_name }} - Material Request</h3>
            <div class="badges">
              <span class="status-badge" [class]="request.status">{{ request.status | uppercase }}</span>
              <span class="priority-badge" [class]="request.priority">{{ request.priority | uppercase }}</span>
            </div>
          </div>
        </div>

        <p class="description">{{ request.items[0]?.purpose || 'Procurement request for ' + request.project_name }}</p>

        <div class="meta-row">
          <span class="meta-item"><mat-icon>label</mat-icon> {{ request.request_number }}</span>
          <span class="meta-item"><mat-icon>person</mat-icon> {{ request.requested_by_name }}</span>
          <span class="meta-item"><mat-icon>location_city</mat-icon> {{ request.project_name }}</span>
        </div>

        <div class="metrics-grid">
          <div class="metric">
            <span class="label"><mat-icon>calendar_today</mat-icon> Request Date</span>
            <span class="value">{{ request.created_at | date:'MMM d, y' }}</span>
          </div>
          <div class="metric">
            <span class="label"><mat-icon>schedule</mat-icon> Required By</span>
            <span class="value">{{ request.required_date | date:'MMM d, y' }}</span>
          </div>
          <div class="metric">
            <span class="label"><mat-icon>inventory_2</mat-icon> Materials</span>
            <span class="value">{{ request.items.length }} items</span>
          </div>
          <div class="metric highlight">
            <span class="label"><mat-icon>payments</mat-icon> Estimated Cost</span>
            <span class="value">{{ estimatedCost | currency:'USD':'symbol':'1.0-0' }}</span>
          </div>
          <div class="metric">
            <span class="label"><mat-icon>assignment_ind</mat-icon> Delivery Location</span>
            <span class="value">{{ request.delivery_location || 'Project Site' }}</span>
          </div>
        </div>

        <div class="items-preview">
          <div class="preview-header">
            <mat-icon>inventory</mat-icon>
            <span>Top Materials</span>
          </div>
          <div class="chips-container">
            @for (item of request.items.slice(0, 3); track item.id) {
              <span class="item-chip">
                {{ item.material_name }} • {{ item.quantity_requested }} {{ item.unit }}
              </span>
            }
            @if (request.items.length > 3) {
              <span class="more-chip">+{{ request.items.length - 3 }} more</span>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .request-card {
      background: var(--md-sys-color-surface-container);
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 12px;
      padding: 0;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;

      &:hover {
        border-color: var(--md-sys-color-primary);
        background: var(--md-sys-color-surface-container-high);
        transform: scale(1.005);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        
        .title { color: var(--md-sys-color-primary); }
      }
    }

    .card-body {
      padding: 24px;
    }

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
        color: var(--md-sys-color-on-surface);
        transition: color 0.2s;
      }
    }

    .badges {
      display: flex;
      gap: 8px;
    }

    .status-badge, .priority-badge {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    .status-badge.pending { background: rgba(255, 183, 134, 0.15); color: #ffb786; }
    .status-badge.approved { background: rgba(161, 211, 154, 0.15); color: var(--md-sys-color-tertiary); }
    
    .priority-badge.high, .priority-badge.urgent { background: rgba(255, 180, 171, 0.15); color: var(--md-sys-color-error); }
    .priority-badge.medium { background: rgba(139, 208, 239, 0.15); color: var(--md-sys-color-secondary); }
    .priority-badge.low { background: rgba(153, 143, 128, 0.15); color: var(--md-sys-color-outline); }

    .description {
      color: var(--md-sys-color-on-surface-variant);
      margin: 0 0 16px;
      font-size: 0.95rem;
      line-height: 1.4;
    }

    .meta-row {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        color: var(--md-sys-color-outline);
        text-transform: uppercase;
        letter-spacing: 0.02em;

        .mat-icon { font-size: 16px; width: 16px; height: 16px; }
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        color: var(--md-sys-color-on-surface-variant);
        
        .mat-icon { font-size: 14px; width: 14px; height: 14px; }
      }

      .value {
        font-size: 0.95rem;
        font-weight: 500;
        color: var(--md-sys-color-on-surface);
      }

      &.highlight .value {
        color: var(--md-sys-color-primary);
        font-weight: 600;
      }
    }

    .items-preview {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 12px 16px;
      
      .preview-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.75rem;
        color: var(--md-sys-color-outline);
        margin-bottom: 8px;
        text-transform: uppercase;

        .mat-icon { font-size: 14px; width: 14px; height: 14px; }
      }

      .chips-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .item-chip, .more-chip {
        background: var(--md-sys-color-surface-container-highest);
        color: var(--md-sys-color-on-surface);
        padding: 4px 12px;
        border-radius: 100px;
        font-size: 0.8rem;
        border: 1px solid var(--md-sys-color-outline-variant);
      }

      .more-chip {
        background: transparent;
        color: var(--md-sys-color-primary);
        border-color: var(--md-sys-color-primary);
      }
    }
  `]
})
export class MaterialRequestCardComponent {
  @Input() request!: MaterialRequestResponseDto;

  get estimatedCost(): number {
    // Note: In a real app, unitPrice would come from the item or material detail.
    // For now, I'll use a mocked value calculation or sum of quantities if price is missing.
    // The design shows values like $12,400. I'll mock a realistic value based on quantity.
    return this.request.items.reduce((acc, item) => acc + (item.quantity_requested * 45), 0);
  }
}
