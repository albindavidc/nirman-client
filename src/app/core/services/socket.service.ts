import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { Observable, Observer, Subject } from 'rxjs';
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

  // Dedicated subjects for persistent event streaming
  private incomingCallSubject = new Subject<any>();
  private callAcceptedSubject = new Subject<any>();
  private callOfferSubject = new Subject<any>();
  private callAnswerSubject = new Subject<any>();
  private iceCandidateSubject = new Subject<any>();
  private callEndedSubject = new Subject<any>();
  private callRejectedSubject = new Subject<any>();

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
        query: { userId },
        transports: ['websocket', 'polling']
      });
    }

    // Connect to Call Namespace
    if (!this.callSocket || !this.callSocket.connected) {
      if (this.callSocket) this.callSocket.disconnect();
      
      this.callSocket = io(`${backendUrl}/call`, {
        withCredentials: true,
        query: { userId },
        transports: ['websocket', 'polling']
      });

      this.callSocket.on('connect', () => {
        console.log('[SocketService] Connected to call namespace');
        this.registerUser(userId);
      });

      // Attach global listeners that push to subjects
      this.callSocket.on('call:incoming', (data) => {
        console.log('[SocketService] Received call:incoming', data);
        this.incomingCallSubject.next(data);
      });

      this.callSocket.on('call:accepted', (data) => {
        console.log('[SocketService] Received call:accepted', data);
        this.callAcceptedSubject.next(data);
      });

      this.callSocket.on('call:offer', (data) => {
        console.log('[SocketService] Received call:offer', data);
        this.callOfferSubject.next(data);
      });

      this.callSocket.on('call:answer', (data) => {
        console.log('[SocketService] Received call:answer', data);
        this.callAnswerSubject.next(data);
      });

      this.callSocket.on('call:ice-candidate', (data) => {
        this.iceCandidateSubject.next(data);
      });

      this.callSocket.on('call:ended', (data) => {
        console.log('[SocketService] Received call:ended', data);
        this.callEndedSubject.next(data);
      });

      this.callSocket.on('call:rejected', (data) => {
        console.log('[SocketService] Received call:rejected', data);
        this.callRejectedSubject.next(data);
      });
    }
  }

  registerUser(userId: string) {
    console.log(`[SocketService] Registering user ${userId}`);
    this.callSocket?.emit('user:register', { userId });
  }

  disconnect() {
    if (this.chatSocket) this.chatSocket.disconnect();
    if (this.callSocket) this.callSocket.disconnect();
  }

  // --- Chat Methods ---
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

  onUserStatusChanged(): Observable<{ userId: string, isOnline: boolean }> {
    return new Observable(observer => {
      this.chatSocket?.on('userStatusChanged', (data: { userId: string, isOnline: boolean }) => observer.next(data));
    });
  }

  // --- Call Methods ---
  initiateCall(payload: { threadId: string, type: 'audio'|'video', targetUserId: string, callId: string, callerName?: string, callerRole?: string }) {
    console.log('[SocketService] Emitting call:initiate', payload);
    this.callSocket?.emit('call:initiate', payload);
  }

  offerCall(payload: { callId: string, offer: unknown, targetUserId: string }) {
    this.callSocket?.emit('call:offer', payload);
  }

  answerCall(payload: { callId: string, answer: unknown, targetUserId: string }) {
    this.callSocket?.emit('call:answer', payload);
  }

  sendIceCandidate(payload: { callId: string, candidate: unknown, targetUserId: string }) {
    this.callSocket?.emit('call:ice-candidate', payload);
  }

  endCall(callId: string, targetUserId?: string) {
    this.callSocket?.emit('call:end', { callId, targetUserId });
  }

  rejectCall(payload: { callId: string, targetUserId: string }) {
    this.callSocket?.emit('call:reject', payload);
  }

  acceptCall(payload: { callId: string, targetUserId: string }) {
    this.callSocket?.emit('call:accept', payload);
  }

  // Call Event Listeners - Now returning persistent observables
  onIncomingCall(): Observable<any> {
    return this.incomingCallSubject.asObservable();
  }

  onCallAccepted(): Observable<any> {
    return this.callAcceptedSubject.asObservable();
  }

  onCallOffer(): Observable<any> {
    return this.callOfferSubject.asObservable();
  }

  onCallAnswer(): Observable<any> {
    return this.callAnswerSubject.asObservable();
  }

  onIceCandidate(): Observable<any> {
    return this.iceCandidateSubject.asObservable();
  }

  onCallEnded(): Observable<any> {
    return this.callEndedSubject.asObservable();
  }

  onCallRejected(): Observable<any> {
    return this.callRejectedSubject.asObservable();
  }
}
