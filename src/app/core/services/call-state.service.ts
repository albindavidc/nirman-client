import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SignalingPayload, CallSessionResponseDto } from '../../features/shared-features/communication/models/communication.models';
import { Chat } from '../../features/shared-features/communication/communication-layout.component';
import { SocketService } from './socket.service';
import { CommunicationService } from '../../features/shared-features/communication/services/communication.service';

import { Store } from '@ngrx/store';
import { selectUser } from '../../features/auth/login/store/login.selectors';

@Injectable({
  providedIn: 'root'
})
export class CallStateService {
  private socketService = inject(SocketService);
  private communicationService = inject(CommunicationService);
  private store = inject(Store);

  private currentUser: any = null;

  private isCallingSource = new BehaviorSubject<boolean>(false);
  isCalling$ = this.isCallingSource.asObservable();

  private incomingCallSource = new BehaviorSubject<SignalingPayload | null>(null);
  incomingCall$ = this.incomingCallSource.asObservable();

  // Active call details
  callType: 'audio' | 'video' = 'audio';
  callId: string | null = null;
  isInitiator = false;
  targetUserId: string | null = null;
  selectedChat: Chat | null = null;
  
  // Caller/Receiver UI details
  callerName?: string;
  callerRole?: string;

  constructor() {
    this.setupListeners();
    this.store.select(selectUser).subscribe(user => {
      this.currentUser = user;
    });
  }

  private setupListeners() {
    this.socketService.onIncomingCall().subscribe((data: any) => {
      console.log('[CallStateService] Processing incoming call', data);
      const payload = data as SignalingPayload;
      this.incomingCallSource.next(payload);
      
      // Store info for UI
      this.callerName = data.callerName;
      this.callerRole = data.callerRole;
      
      if (payload.callId) {
        this.communicationService.updateCallStatus(payload.callId, 'ringing').subscribe();
      }
    });

    this.socketService.onCallEnded().subscribe(() => {
      this.endCall();
    });

    this.socketService.onCallRejected().subscribe(() => {
      this.endCall();
    });
  }

  startCall(chat: Chat, type: 'audio' | 'video', projectId?: string) {
    if (!chat.otherParticipantId) return;

    this.targetUserId = chat.otherParticipantId;
    this.callType = type;
    this.isInitiator = true;
    this.selectedChat = chat;
    this.callerName = chat.name;
    this.callerRole = chat.otherParticipantRole;

    this.communicationService.startCall({
      threadId: chat.threadId,
      type: type,
      projectId: projectId
    }).subscribe((session: CallSessionResponseDto) => {
      this.callId = session.id;
      this.isCallingSource.next(true);
      
      if (this.callId) {
        this.socketService.initiateCall({
          threadId: chat.threadId,
          type,
          targetUserId: this.targetUserId!,
          callId: this.callId,
          callerName: this.currentUser?.name || 'Nirman User',
          callerRole: this.currentUser?.role || 'Admin'
        });
      }
    });
  }

  acceptCall() {
    const incoming = this.incomingCallSource.value;
    if (!incoming) return;

    this.callId = incoming.callId || null;
    this.callType = (incoming.type as 'audio' | 'video') || 'audio';
    this.targetUserId = incoming.initiatorId || null;
    this.isInitiator = false;
    
    // For incoming calls, 'selectedChat' is created from signaling data
    this.selectedChat = {
      id: incoming.threadId || '',
      threadId: incoming.threadId || '',
      name: this.callerName || 'Incoming Call',
      otherParticipantRole: this.callerRole,
      otherParticipantId: incoming.initiatorId, // CRITICAL: needed for signaling back
      active: true,
      lastMessage: '',
      time: '',
      participants: []
    };

    this.isCallingSource.next(true);
    this.incomingCallSource.next(null);

    if (this.callId && this.targetUserId) {
      this.socketService.acceptCall({
        callId: this.callId,
        targetUserId: this.targetUserId
      });
      this.communicationService.updateCallStatus(this.callId, 'connected').subscribe();
    }
  }

  rejectCall() {
    const incoming = this.incomingCallSource.value;
    if (incoming && incoming.callId) {
      this.socketService.rejectCall({
        callId: incoming.callId,
        targetUserId: incoming.initiatorId!
      });
      this.communicationService.updateCallStatus(incoming.callId, 'rejected').subscribe();
    }
    this.incomingCallSource.next(null);
  }

  endCall(summary?: { duration: string, type: string, endedAt: Date }) {
    if (summary && this.selectedChat && this.isInitiator) {
      const messageContent = `[CALL_LOG]:{"type":"${summary.type}","duration":"${summary.duration}"}`;
      this.socketService.sendMessage({
        threadId: this.selectedChat.threadId,
        content: messageContent
      });
    }

    if (this.callId && !summary) {
       this.socketService.endCall(this.callId, this.targetUserId || undefined);
    }

    this.isCallingSource.next(false);
    this.callId = null;
    this.isInitiator = false;
    this.targetUserId = null;
    this.incomingCallSource.next(null);
    this.callerName = undefined;
    this.callerRole = undefined;
  }
}
