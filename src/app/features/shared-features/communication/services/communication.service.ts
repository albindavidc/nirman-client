import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../../core/services/config.service';
import { ChatThreadResponseDto, ChatMessageResponseDto, CallSessionResponseDto, CreateChatThreadDto, ChatThreadListItem } from '../models/communication.models';

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private get apiUrl() {
    return `${this.configService.apiUrl}/communication`;
  }

  getThreadList(): Observable<ChatThreadListItem[]> {
    return this.http.get<ChatThreadListItem[]>(`${this.apiUrl}/threads-list`);
  }

  getProjectThreads(projectId: string): Observable<ChatThreadResponseDto[]> {
    return this.http.get<ChatThreadResponseDto[]>(`${this.apiUrl}/threads/project/${projectId}`);
  }

  getMyThreads(): Observable<ChatThreadResponseDto[]> {
    return this.http.get<ChatThreadResponseDto[]>(`${this.apiUrl}/threads/me`);
  }

  getThreadMessages(threadId: string): Observable<ChatMessageResponseDto[]> {
    return this.http.get<ChatMessageResponseDto[]>(`${this.apiUrl}/threads/${threadId}/messages`);
  }

  createThread(dto: CreateChatThreadDto): Observable<ChatThreadResponseDto> {
    return this.http.post<ChatThreadResponseDto>(`${this.apiUrl}/threads`, dto);
  }

  deleteThread(threadId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/threads/${threadId}`);
  }

  markThreadAsRead(threadId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/threads/${threadId}/read`, {});
  }

  // --- Calls ---

  startCall(dto: { threadId: string; projectId?: string; type: 'audio' | 'video' }): Observable<CallSessionResponseDto> {
    return this.http.post<CallSessionResponseDto>(`${this.apiUrl}/calls`, dto);
  }

  getCallSession(sessionId: string): Observable<CallSessionResponseDto> {
    return this.http.get<CallSessionResponseDto>(`${this.apiUrl}/calls/${sessionId}`);
  }

  updateCallStatus(sessionId: string, status: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/calls/${sessionId}/status`, { status });
  }
}
