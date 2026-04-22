import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../core/services/config.service';
import {
  MasterMaterial,
  CreateMasterMaterialDto,
  UpdateMasterMaterialDto,
} from '../models/master-material.model';

@Injectable({
  providedIn: 'root',
})
export class MasterMaterialService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  private readonly apiUrl = `${this.configService.apiBaseUrl}/api/v1/admin/materials`;

  getAll(): Observable<MasterMaterial[]> {
    return this.http.get<MasterMaterial[]>(this.apiUrl);
  }

  create(dto: CreateMasterMaterialDto): Observable<MasterMaterial> {
    return this.http.post<MasterMaterial>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateMasterMaterialDto): Observable<MasterMaterial> {
    return this.http.put<MasterMaterial>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
