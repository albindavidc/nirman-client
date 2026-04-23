import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../core/services/config.service';
import {
  GetMaterialRequestDto,
  MaterialApprovalStatsDto,
  MaterialRequestResponseDto,
  PaginatedMaterialRequestResponseDto,
} from '../../../shared/models/material-request.model';
import { CreatePurchaseOrderDto, PurchaseOrderResponseDto } from '../../../shared/models/purchase-order.model';

@Injectable({
  providedIn: 'root',
})
export class MaterialApprovalService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  private get apiUrl(): string {
    return `${this.configService.apiUrl}/materials`;
  }

  getApprovals(
    query: GetMaterialRequestDto,
  ): Observable<PaginatedMaterialRequestResponseDto> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());
    if (query.projectId) params = params.set('projectId', query.projectId);
    if (query.status) params = params.set('status', query.status);

    return this.http.get<PaginatedMaterialRequestResponseDto>(
      `${this.apiUrl}/approvals`,
      { params },
    );
  }

  getStats(): Observable<MaterialApprovalStatsDto> {
    return this.http.get<MaterialApprovalStatsDto>(
      `${this.apiUrl}/approvals/stats`,
    );
  }

  approveRequest(
    id: string,
    comments?: string,
    vendorId?: string,
  ): Observable<MaterialRequestResponseDto> {
    return this.http.patch<MaterialRequestResponseDto>(
      `${this.apiUrl}/requests/${id}/approve`,
      { comments, vendorId },
    );
  }

  rejectRequest(
    id: string,
    reason: string,
  ): Observable<MaterialRequestResponseDto> {
    return this.http.patch<MaterialRequestResponseDto>(
      `${this.apiUrl}/requests/${id}/reject`,
      { reason },
    );
  }

  setRequestVendor(
    id: string,
    vendorId: string,
  ): Observable<MaterialRequestResponseDto> {
    return this.http.patch<MaterialRequestResponseDto>(
      `${this.apiUrl}/requests/${id}/vendor`,
      { vendorId },
    );
  }

  createPurchaseOrder(
    projectId: string,
    dto: CreatePurchaseOrderDto,
  ): Observable<PurchaseOrderResponseDto> {
    return this.http.post<PurchaseOrderResponseDto>(
      `${this.apiUrl}/project/${projectId}/purchase-orders`,
      dto,
    );
  }
}
