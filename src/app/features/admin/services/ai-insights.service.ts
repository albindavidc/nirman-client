import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ProcurementForecastState {
  analysisDate: Date;
  activeProjectsCount: number;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetUtilizationPercentage: number;
  pendingPurchaseOrderValue: number;
  unpaidInvoicesValue: number;
  overdueInvoicesValue: number;
  totalPaidAmount: number;
  projectCashOutFlow: number;
  recommendations: string[];
}

@Injectable({ providedIn: 'root' })
export class AiInsightsService {
  private http = inject(HttpClient);
  // Connects to our backend: /api/v1/ai
  private apiUrl = `${environment.apiUrl}/ai`;

  askProcurementAssistant(query: string): Observable<{ answer: string }> {
    // Backend expects { query: string }
    return this.http.post<{ answer: string }>(
      `${this.apiUrl}/ask-procurement-assistant`,
      { query },
    );
  }

  getCashFlowForecast(
    projectId?: string,
  ): Observable<ProcurementForecastState> {
    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }

    return this.http.get<ProcurementForecastState>(
      `${this.apiUrl}/procurement-forecast-agent`,
      { params },
    );
  }
}
