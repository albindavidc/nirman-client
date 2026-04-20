import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../../../../core/services/config.service';
import {
  Material,
  CreateMaterialDto,
  MaterialTransaction,
  CreateMaterialTransactionDto,
  MaterialRequest,
  CreateMaterialRequestDto,
} from '../models/material.model';
import {
  PurchaseOrderResponseDto,
} from '../../../../shared/models/purchase-order.model';
import {
  GrnResponseDto,
  CreateGrnDto,
} from '../../../../shared/models/grn.model';
import {
  InvoicePrepResponseDto,
  CreateInvoiceDto,
  InvoiceResponseDto,
} from '../../../../shared/models/invoice.model';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  private get apiUrl(): string {
    return this.configService.apiUrl;
  }

  getProjectMaterials(projectId: string): Observable<Material[]> {
    return this.http.get<Material[]>(
      `${this.apiUrl}/materials/project/${projectId}`,
    );
  }

  createMaterial(
    projectId: string,
    data: CreateMaterialDto,
  ): Observable<Material> {
    return this.http.post<Material>(
      `${this.apiUrl}/materials/project/${projectId}`,
      data,
    );
  }

  updateMaterial(
    materialId: string,
    data: Partial<CreateMaterialDto> & { status?: string },
  ): Observable<Material> {
    return this.http.put<Material>(
      `${this.apiUrl}/materials/${materialId}`,
      data,
    );
  }

  updateStock(
    materialId: string,
    data: CreateMaterialTransactionDto,
  ): Observable<MaterialTransaction> {
    return this.http.post<MaterialTransaction>(
      `${this.apiUrl}/materials/${materialId}/stock`,
      data,
    );
  }

  deleteMaterial(materialId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/materials/${materialId}`);
  }

  getTransactions(materialId: string): Observable<MaterialTransaction[]> {
    return this.http
      .get<
        MaterialTransaction[]
      >(`${this.apiUrl}/materials/${materialId}/transactions`)
      .pipe(
        // Mock status for UI demonstration
        map((txs) =>
          txs.map((tx) => ({
            ...tx,
            status: tx.type === 'IN' ? 'delivered' : undefined,
          })),
        ),
      );
  }

  createRequest(data: CreateMaterialRequestDto): Observable<MaterialRequest> {
    return this.http.post<MaterialRequest>(
      `${this.apiUrl}/materials/requests`,
      data,
    );
  }

  getProjectRequests(projectId: string): Observable<MaterialRequest[]> {
    return this.http.get<MaterialRequest[]>(
      `${this.apiUrl}/materials/project/${projectId}/requests`,
    );
  }

  getProjectPurchaseOrders(
    projectId: string,
  ): Observable<PurchaseOrderResponseDto[]> {
    return this.http.get<PurchaseOrderResponseDto[]>(
      `${this.apiUrl}/materials/project/${projectId}/purchase-orders`,
    );
  }

  createGoodsReceipt(
    projectId: string,
    data: CreateGrnDto,
  ): Observable<GrnResponseDto> {
    return this.http.post<GrnResponseDto>(
      `${this.apiUrl}/materials/project/${projectId}/goods-receipts`,
      data,
    );
  }

  getPoGoodsReceipts(
    projectId: string,
    poId: string,
  ): Observable<GrnResponseDto[]> {
    return this.http.get<GrnResponseDto[]>(
      `${this.apiUrl}/materials/project/${projectId}/purchase-orders/${poId}/goods-receipts`,
    );
  }

  getInvoicePrepData(projectId: string, poId: string): Observable<InvoicePrepResponseDto> {
    return this.http.get<InvoicePrepResponseDto>(
      `${this.apiUrl}/materials/purchase-orders/${poId}/invoices-prep-data`,
      { params: { projectId } }
    );
  }

  getInvoices(projectId: string): Observable<InvoiceResponseDto[]> {
    return this.http.get<InvoiceResponseDto[]>(
      `${this.apiUrl}/materials/project/${projectId}/invoices-list`
    );
  }

  getInvoiceById(id: string): Observable<InvoiceResponseDto> {
    return this.http.get<InvoiceResponseDto>(
      `${this.apiUrl}/materials/invoices/${id}`
    );
  }

  createInvoice(projectId: string, data: CreateInvoiceDto): Observable<InvoiceResponseDto> {
    return this.http.post<InvoiceResponseDto>(
      `${this.apiUrl}/materials/project/${projectId}/invoices`,
      data
    );
  }
}

