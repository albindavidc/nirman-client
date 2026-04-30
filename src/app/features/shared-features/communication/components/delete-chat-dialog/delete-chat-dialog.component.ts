import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delete-chat-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dialog-overlay" (click)="onCancel()">
      <div class="dialog-content" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
        <div class="dialog-header">
          <mat-icon class="warning-icon">warning_amber</mat-icon>
          <h2>Delete Chat</h2>
        </div>
        
        <div class="dialog-body">
          <p>Are you sure you want to delete this chat? This action cannot be undone and will remove it from your view.</p>
        </div>

        <div class="dialog-actions">
          <button class="btn-cancel" (click)="onCancel()">Cancel</button>
          <button class="btn-delete" (click)="onConfirm()">Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease;
    }

    .dialog-content {
      background: var(--glass-bg-strong);
      backdrop-filter: var(--glass-blur-lg);
      -webkit-backdrop-filter: var(--glass-blur-lg);
      border: 1px solid var(--glass-border-strong);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      width: 100%;
      max-width: 400px;
      box-shadow: var(--shadow-2xl);
      color: var(--text-primary);
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);

      .warning-icon {
        color: var(--md-sys-color-error);
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      h2 {
        margin: 0;
        font-size: var(--text-xl);
        font-weight: var(--weight-bold);
      }
    }

    .dialog-body {
      margin-bottom: var(--space-8);
      p {
        margin: 0;
        line-height: 1.5;
        color: var(--text-secondary);
      }
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-4);

      button {
        padding: var(--space-2) var(--space-6);
        border-radius: var(--radius-md);
        font-weight: var(--weight-semibold);
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
      }

      .btn-cancel {
        background: var(--glass-bg-subtle);
        color: var(--text-primary);
        border: 1px solid var(--glass-border);
        &:hover {
          background: var(--surface-hover);
        }
      }

      .btn-delete {
        background: var(--md-sys-color-error);
        color: var(--md-sys-color-on-error);
        &:hover {
          filter: brightness(1.1);
          box-shadow: 0 4px 12px rgba(255, 180, 171, 0.3);
        }
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class DeleteChatDialogComponent {
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void { this.confirmed.emit(); }
  onCancel(): void { this.cancelled.emit(); }
}
