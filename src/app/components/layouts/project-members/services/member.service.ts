import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../../core/services/config.service';
import { Member, MemberListResponse } from '../models/member.model';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiUrl = `${this.configService.apiUrl}/members`;

  getMembers(
    page = 1,
    limit = 10,
    role?: string,
    search?: string
  ): Observable<MemberListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (role) {
      params = params.set('role', role);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<MemberListResponse>(this.apiUrl, { params });
  }

  addMember(member: Partial<Member>): Observable<Member> {
    return this.http.post<Member>(this.apiUrl, member);
  }

  editMember(id: string, member: Partial<Member>): Observable<Member> {
    return this.http.put<Member>(`${this.apiUrl}/${id}`, member);
  }

  blockMember(id: string): Observable<Member> {
    return this.http.put<Member>(`${this.apiUrl}/${id}/block`, {});
  }

  unblockMember(id: string): Observable<Member> {
    return this.http.put<Member>(`${this.apiUrl}/${id}/unblock`, {});
  }
}
