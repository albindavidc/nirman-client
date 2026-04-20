import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { Observable, Observer } from 'rxjs';
import { ConfigService } from './config.service';
import { Store } from '@ngrx/store';
import { selectUser } from '../../features/auth/login/store/login.selectors';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private configService = inject(ConfigService);
  private platformId = inject(PLATFORM_ID);
  private store = inject(Store);
  private chatSocket!: Socket;
  private callSocket!: Socket;

  initSockets() {
    if (isPlatformBrowser(this.platformId)) {
      this.subsToUser();
    }
  }

  private subsToUser() {
    this.store.select(selectUser).subscribe(user => {
      if (user && user.id) {
        this.connect(user.id);
      } else {
        this.disconnect();
      }
    });
  }

  private connect(userId: string) {
    const backendUrl = this.configService.apiUrl?.replace('/api/v1', '') || 'http://localhost:3000';
    
    // Connect to Chat Namespace
    if (!this.chatSocket) {
      this.chatSocket = io(`${backendUrl}/chat`, {
        withCredentials: true,
        query: { userId }
      });
    }

    // Connect to Call Namespace
    if (!this.callSocket || !this.callSocket.connected) {
      if (this.callSocket) this.callSocket.disconnect();
      
      this.callSocket = io(`${backendUrl}/call`, {
        withCredentials: true,
        query: { userId }
      });
    }
  }

  disconnect() {
    if (this.chatSocket) {
      this.chatSocket.disconnect();
    }
    if (this.callSocket) {
      this.callSocket.disconnect();
    }
  }

  // --- Chate Methods ---
  joinThread(threadId: string) {
    this.chatSocket?.emit('joinThread', { threadId });
  }

  sendMessage(payload: unknown) {
    this.chatSocket?.emit('sendMessage', payload);
  }

  onNewMessage(): Observable<unknown> {
    return new Observable(observer => {
      this.chatSocket?.on('newMessage', (msg) => observer.next(msg));
    });
  }

  // --- Call Methods ---
  startCall(payload: { threadId: string, type: 'audio'|'video', targetUserId: string, callId: string }) {
    this.callSocket?.emit('startCall', payload);
  }

  offerCall(payload: { callId: string, offer: unknown, targetUserId: string }) {
    this.callSocket?.emit('offer', payload);
  }

  answerCall(payload: { callId: string, answer: unknown, targetUserId: string }) {
    this.callSocket?.emit('answer', payload);
  }

  sendIceCandidate(payload: { callId: string, candidate: unknown, targetUserId: string }) {
    this.callSocket?.emit('iceCandidate', payload);
  }

  endCall(callId: string, targetUserId?: string) {
    this.callSocket?.emit('endCall', { callId, targetUserId });
  }

  rejectCall(payload: { callId: string, targetUserId: string }) {
    this.callSocket?.emit('rejectCall', payload);
  }

  // Call Event Listeners
  onIncomingCall(): Observable<unknown> {
    return new Observable((observer: Observer<unknown>) => {
      this.callSocket?.on('incomingCall', (data) => observer.next(data));
    });
  }

  onCallOffer(): Observable<unknown> {
    return new Observable((observer: Observer<unknown>) => {
      this.callSocket?.on('offer', (data) => observer.next(data));
    });
  }

  onCallAnswer(): Observable<unknown> {
    return new Observable((observer: Observer<unknown>) => {
      this.callSocket?.on('answer', (data) => observer.next(data));
    });
  }

  onIceCandidate(): Observable<unknown> {
    return new Observable((observer: Observer<unknown>) => {
      this.callSocket?.on('iceCandidate', (data) => observer.next(data));
    });
  }

  onCallEnded(): Observable<unknown> {
    return new Observable((observer: Observer<unknown>) => {
      this.callSocket?.on('callEnded', (data) => observer.next(data));
    });
  }
}
