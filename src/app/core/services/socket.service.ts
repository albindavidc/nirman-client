import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
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
  private chatSocket!: Socket;
  private callSocket!: Socket;
  private store = inject(Store);

  constructor(
    private configService: ConfigService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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

  sendMessage(payload: any) {
    this.chatSocket?.emit('sendMessage', payload);
  }

  onNewMessage(): Observable<any> {
    return new Observable(observer => {
      this.chatSocket?.on('newMessage', (msg) => observer.next(msg));
    });
  }

  // --- Call Methods ---
  startCall(payload: { threadId: string, type: 'audio'|'video', targetUserId: string, callId: string }) {
    this.callSocket?.emit('startCall', payload);
  }

  offerCall(payload: { callId: string, offer: any, targetUserId: string }) {
    this.callSocket?.emit('offer', payload);
  }

  answerCall(payload: { callId: string, answer: any, targetUserId: string }) {
    this.callSocket?.emit('answer', payload);
  }

  sendIceCandidate(payload: { callId: string, candidate: any, targetUserId: string }) {
    this.callSocket?.emit('iceCandidate', payload);
  }

  endCall(callId: string, targetUserId?: string) {
    this.callSocket?.emit('endCall', { callId, targetUserId });
  }

  rejectCall(payload: { callId: string, targetUserId: string }) {
    this.callSocket?.emit('rejectCall', payload);
  }

  // Call Event Listeners
  onIncomingCall(): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      this.callSocket?.on('incomingCall', (data) => observer.next(data));
    });
  }

  onCallOffer(): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      this.callSocket?.on('offer', (data) => observer.next(data));
    });
  }

  onCallAnswer(): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      this.callSocket?.on('answer', (data) => observer.next(data));
    });
  }

  onIceCandidate(): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      this.callSocket?.on('iceCandidate', (data) => observer.next(data));
    });
  }

  onCallEnded(): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      this.callSocket?.on('callEnded', (data) => observer.next(data));
    });
  }
}
