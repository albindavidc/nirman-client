import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MaterialRequestResponseDto } from '../../../../../shared/models/material-request.model';

@Component({
  selector: 'app-material-request-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
  ],
  templateUrl: './material-request-card.component.html',
  styleUrls: ['./material-request-card.component.scss'],
})
export class MaterialRequestCardComponent {
  @Input() request!: MaterialRequestResponseDto;
  @Input() isAdmin = false;

  get estimatedCost(): number {
    return this.request.items.reduce(
      (acc, item) => acc + item.quantity_requested * 45,
      0,
    );
  }

}
