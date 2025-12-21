import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Vendor,
  VendorListResponse,
  VendorFilters,
  UpdateVendorDto,
} from '../models/vendor.models';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/vendors`;

  getVendors(filters?: VendorFilters): Observable<VendorListResponse> {
    let params = new HttpParams();

    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters?.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<VendorListResponse>(this.apiUrl, { params });
  }

  getVendorById(id: string): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.apiUrl}/${id}`);
  }

  updateVendor(id: string, data: UpdateVendorDto): Observable<Vendor> {
    return this.http.patch<Vendor>(`${this.apiUrl}/${id}`, data);
  }

  createVendor(data: any): Observable<Vendor> {
    return this.http.post<Vendor>(this.apiUrl, data);
  }

  approveVendor(id: string): Observable<Vendor> {
    return this.updateVendor(id, { vendorStatus: 'approved' });
  }

  rejectVendor(id: string): Observable<Vendor> {
    return this.updateVendor(id, { vendorStatus: 'rejected' });
  }

  blacklistVendor(id: string): Observable<Vendor> {
    return this.updateVendor(id, { vendorStatus: 'blacklisted' });
  }

  deleteVendor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getVendorStats(): Observable<{
    total: number;
    active: number;
    avgRating: number;
    onTimeDelivery: number;
  }> {
    return this.http.get<{
      total: number;
      active: number;
      avgRating: number;
      onTimeDelivery: number;
    }>(`${this.apiUrl}/stats`);
  }
}
