import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../../../core/services/config.service';
import {
  Material,
  CreateMaterialDto,
  MaterialTransaction,
  CreateMaterialTransactionDto,
  MaterialRequest,
  CreateMaterialRequestDto,
} from '../models/material.model';

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

  updateStock(
    materialId: string,
    data: CreateMaterialTransactionDto,
  ): Observable<MaterialTransaction> {
    return this.http.post<MaterialTransaction>(
      `${this.apiUrl}/materials/${materialId}/stock`,
      data,
    );
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
}
