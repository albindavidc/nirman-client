import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chat-context-menu',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="context-menu" 
      [style.left.px]="x" 
      [style.top.px]="y"
      (click)="$event.stopPropagation()"
    >
      <button class="context-menu__item context-menu__item--danger" (click)="onDelete()">
        <mat-icon>delete_outline</mat-icon>
        <span>Delete Chat</span>
      </button>
    </div>
  `,
  styles: [`
    .context-menu {
      position: fixed;
      z-index: 9999;
      background: var(--glass-bg-strong);
      backdrop-filter: var(--glass-blur-lg);
      -webkit-backdrop-filter: var(--glass-blur-lg);
      border: 1px solid var(--glass-border-strong);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      min-width: 160px;
      padding: 4px 0;
      animation: fadeIn 0.1s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.96); }
      to   { opacity: 1; transform: scale(1); }
    }

    .context-menu__item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 16px;
      font-size: 13px;
      background: transparent;
      border: none;
      cursor: pointer;
      text-align: left;
      color: var(--text-primary);
      transition: background 0.2s ease;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &:hover {
        background: var(--surface-hover);
      }

      &--danger {
        color: var(--md-sys-color-error);
        &:hover {
          background: rgba(255, 180, 171, 0.1);
        }
      }
    }
  `]
})
export class ChatContextMenuComponent {
  @Input() x = 0;
  @Input() y = 0;
  @Output() deleteClicked = new EventEmitter<void>();

  onDelete(): void {
    this.deleteClicked.emit();
  }
}
