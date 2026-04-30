import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-archive-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!isActive) {
      <span class="archive-badge">Archived</span>
    }
  `,
  styles: [`
    .archive-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
  `],
})
export class ArchiveBadgeComponent {
  @Input() isActive!: boolean;
}
