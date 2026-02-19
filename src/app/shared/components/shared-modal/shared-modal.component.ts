import {
  Component,
  Input,
  Output,
  EventEmitter,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-shared-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './shared-modal.component.html',
  styleUrl: './shared-modal.component.scss',
})
export class SharedModalComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input({ transform: booleanAttribute }) hasActions = true;

  @Output() closeModal = new EventEmitter<void>();

  onClose(): void {
    this.closeModal.emit();
  }
}
