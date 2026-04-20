import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MaterialRequestResponseDto } from '../../../../../shared/models/material-request.model';

@Component({
  selector: 'app-material-request-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatChipsModule],
  templateUrl: './material-request-card.component.html',
  styleUrls: ['./material-request-card.component.scss']
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
