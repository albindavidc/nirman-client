import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MaterialApprovalStatsDto } from '../../../../../shared/models/material-request.model';

@Component({
  selector: 'app-material-stats-cards',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './material-stats-cards.component.html',
  styleUrls: ['./material-stats-cards.component.scss'],
})
export class MaterialStatsCardsComponent {
  @Input() stats!: MaterialApprovalStatsDto;
}
