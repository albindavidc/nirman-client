import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../../core/services/socket.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChatComponent } from './components/chat/chat.component';
import { CallComponent } from './components/call/call.component';
import { Store } from '@ngrx/store';

import { CommunicationService } from './services/communication.service';
import { ChatThreadResponseDto } from './models/communication.models';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NewChatModalComponent } from './components/new-chat-modal/new-chat-modal.component';
import { selectUser } from '../../auth/login/store/login.selectors';

@Component({
  selector: 'app-communication-layout',
  standalone: true,
  imports: [
    CommonModule,
    ChatComponent,
    CallComponent,
    FormsModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './communication-layout.component.html',
  styleUrls: ['./communication-layout.component.scss'],
})
export class CommunicationLayoutComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private communicationService = inject(CommunicationService);
  private socketService = inject(SocketService);
  private dialog = inject(MatDialog);

  activeThreadId: string | null = null;
  searchQuery: string = '';
  
  recentChats: any[] = [];
  selectedChat: any = null;

  isCalling: boolean = false;
  incomingCall: any = null;
  callType: 'audio' | 'video' = 'audio';
  callId: string | null = null;
  isInitiator: boolean = false;
  targetUserId: string | null = null;
  
  projectId: string | null = null;
  private subs = new Subscription();

  ngOnInit() {
    this.socketService.initSockets();

    this.subs.add(
      this.socketService.onIncomingCall().subscribe((data) => {
        this.incomingCall = data;
        // Search for the chat if it's not the current one
        const chat = this.recentChats.find(c => c.threadId === data.threadId);
        if (chat) this.selectedChat = chat;
        
        // Update status to ringing on backend
        if (data.callId) {
          this.communicationService.updateCallStatus(data.callId, 'ringing').subscribe();
        }
      })
    );

    this.subs.add(
      this.socketService.onCallEnded().subscribe((data) => {
        if (data.callId === this.callId || (this.incomingCall && this.incomingCall.callId === data.callId)) {
          this.endCall();
        }
      })
    );

    this.loadMyThreads();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.socketService.disconnect();
  }

  loadMyThreads() {
    this.subs.add(
      this.communicationService.getMyThreads().subscribe((threads) => {
        this.recentChats = threads.map(t => ({
          id: t.id,
          threadId: t.id,
          name: t.title || 'Direct Message',
          participants: t.participants,
          lastMessage: '', 
          time: new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          active: false
        }));

        if (this.recentChats.length > 0 && !this.selectedChat) {
          this.selectChat(this.recentChats[0]);
        }
      })
    );
  }

  selectChat(chat: any) {
    this.recentChats.forEach(c => c.active = false);
    chat.active = true;
    this.selectedChat = chat;
    this.activeThreadId = chat.threadId;
  }

  openNewChatModal() {
    const dialogRef = this.dialog.open(NewChatModalComponent, {
      width: '450px',
      panelClass: 'dark-dialog'
    });

    dialogRef.afterClosed().subscribe(partner => {
      if (partner) {
        this.communicationService.createThread({
          title: `DM with ${partner.name}`,
          participants: [
            { userId: partner.userId, role: partner.type }
          ]
        }).subscribe(newThread => {
          this.loadMyThreads(); // refresh list
        });
      }
    });
  }

  async startCall(type: 'audio' | 'video') {
    if (!this.selectedChat || !this.selectedChat.participants) return;

    // Find the other participant for 1v1
    // For now, we assume the first participant that isn't the current user is the target
    // We should ideally have the currentUser injected or available from state
    this.subs.add(
      this.store.select(selectUser).subscribe(user => {
        if (!user) return;
        
        const otherParticipant = this.selectedChat.participants.find((p: any) => p.userId !== user.id);
        if (!otherParticipant) return;

        this.targetUserId = otherParticipant.userId;
        this.callType = type;
        this.isInitiator = true;

        this.communicationService.startCall({
          threadId: this.selectedChat.threadId,
          type: type,
          projectId: this.projectId || undefined
        }).subscribe(session => {
          this.callId = session.id;
          this.isCalling = true;
          
          this.socketService.startCall({
            threadId: this.selectedChat.threadId,
            type,
            targetUserId: this.targetUserId!,
            callId: this.callId // Pass the call session ID
          });
        });
      })
    );
  }

  acceptCall() {
    if (!this.incomingCall) return;
    
    this.callId = this.incomingCall.callId;
    this.callType = this.incomingCall.type;
    this.targetUserId = this.incomingCall.initiatorId; // In incoming event, we should send initiatorId
    this.isInitiator = false;
    this.isCalling = true;
    this.incomingCall = null;

    // Update status to connected on backend
    if (this.callId) {
      this.communicationService.updateCallStatus(this.callId, 'connected').subscribe();
    }
  }

  rejectCall() {
    if (this.incomingCall && this.incomingCall.callId) {
      this.socketService.rejectCall({
        callId: this.incomingCall.callId,
        targetUserId: this.incomingCall.initiatorId
      });
      this.communicationService.updateCallStatus(this.incomingCall.callId, 'rejected').subscribe();
    }
    this.incomingCall = null;
  }

  endCall() {
    this.isCalling = false;
    this.callId = null;
    this.isInitiator = false;
    this.targetUserId = null;
  }
}
