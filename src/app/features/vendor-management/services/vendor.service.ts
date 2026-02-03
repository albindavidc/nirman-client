import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../core/services/config.service';
import {
  Vendor,
  VendorListResponse,
  VendorFilters,
  UpdateVendorDto,
  CreateVendorDto,
  VendorStats,
} from '../models/vendor.models';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);
  private readonly apiUrl = `${this.configService.apiUrl}/vendors`;

  getVendors(filters?: VendorFilters): Observable<VendorListResponse> {
    let params = new HttpParams()
      .set('page', (filters?.page || 1).toString())
      .set('limit', (filters?.limit || 10).toString());

    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<VendorListResponse>(this.apiUrl, { params });
  }

  getVendorById(id: string): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.apiUrl}/${id}`);
  }

  updateVendor(id: string, data: UpdateVendorDto): Observable<Vendor> {
    return this.http.patch<Vendor>(`${this.apiUrl}/${id}`, data);
  }

  createVendor(data: CreateVendorDto): Observable<Vendor> {
    return this.http.post<Vendor>(this.apiUrl, data);
  }

  approveVendor(id: string): Observable<Vendor> {
    return this.http.patch<Vendor>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectVendor(id: string, reason: string): Observable<Vendor> {
    return this.http.patch<Vendor>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  requestRecheck(id: string): Observable<Vendor> {
    return this.http.patch<Vendor>(`${this.apiUrl}/${id}/request-recheck`, {});
  }

  blacklistVendor(id: string): Observable<Vendor> {
    return this.http.patch<Vendor>(`${this.apiUrl}/${id}/blacklist`, {});
  }

  unblacklistVendor(id: string): Observable<Vendor> {
    return this.http.patch<Vendor>(`${this.apiUrl}/${id}/unblacklist`, {});
  }

  deleteVendor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getVendorStats(): Observable<VendorStats> {
    return this.http.get<VendorStats>(`${this.apiUrl}/stats`);
  }
}
