import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { AiInsightsService, ProcurementForecastState } from '../../../services/ai-insights.service';

@Component({
  selector: 'app-procurement-forecast',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './procurement-forecast.component.html',
  styleUrls: ['./procurement-forecast.component.scss']
})
export class ProcurementForecastComponent implements OnInit {
  private aiService = inject(AiInsightsService);

  forecast = signal<ProcurementForecastState | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadForecast();
  }

  loadForecast() {
    this.isLoading.set(true);
    this.error.set(null);

    this.aiService.getCashFlowForecast().subscribe({
      next: (data) => {
        this.forecast.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load forecast', err);
        this.error.set('Unable to generate AI forecast at this time.');
        this.isLoading.set(false);
      }
    });
  }
}
