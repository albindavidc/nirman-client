import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { VendorStats } from '../models/vendor-dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class VendorDashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api.baseUrl}/api/${environment.api.version}/dashboard/vendor`;

  getVendorStats(): Observable<VendorStats> {
    return this.http.get<VendorStats>(`${this.apiUrl}/stats`);
  }
}
