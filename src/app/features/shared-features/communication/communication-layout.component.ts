import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../../core/services/socket.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChatComponent } from './components/chat/chat.component';
import { CallComponent } from './components/call/call.component';
import { ChatContextMenuComponent } from './components/chat-context-menu/chat-context-menu.component';
import { DeleteChatDialogComponent } from './components/delete-chat-dialog/delete-chat-dialog.component';
import { Store } from '@ngrx/store';

import { CommunicationService } from './services/communication.service';
import { Subscription, take } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HostListener, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { NewChatModalComponent } from './components/new-chat-modal/new-chat-modal.component';
import { selectUser } from '../../auth/login/store/login.selectors';
import { ThreadParticipantDto, SignalingPayload } from './models/communication.models';
import { isUserOnline } from '../../../core/utils/presence.util';

export interface Chat {
  id: string;
  threadId: string;
  name: string;
  projectId?: string | null;
  participants: ThreadParticipantDto[];
  lastMessage: string;
  lastMessageSender?: string;
  time: string;
  active: boolean;
  unreadCount?: number;
  otherParticipantRole?: string;
  otherParticipantIsOnline?: boolean;
  otherParticipantLastSeenAt?: string;
  type?: string;
  callId?: string;
  initiatorId?: string;
}

@Component({
  selector: 'app-communication-layout',
  standalone: true,
  imports: [
    CommonModule,
    ChatComponent,
    CallComponent,
    ChatContextMenuComponent,
    DeleteChatDialogComponent,
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
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  activeThreadId: string | null = null;
  searchQuery = '';
  
  recentChats: Chat[] = [];
  selectedChat: Chat | null = null;
  showSidebar = true;

  isCalling = false;
  incomingCall: SignalingPayload | null = null;
  callType: 'audio' | 'video' = 'audio';
  callId: string | null = null;
  isInitiator = false;
  targetUserId: string | null = null;
  
  projectId: string | null = null;
  
  // Context Menu & Deletion
  contextMenu: { x: number; y: number; threadId: string } | null = null;
  showConfirmDialog = false;
  pendingDeleteThreadId: string | null = null;

  private subs = new Subscription();

  ngOnInit() {

    this.subs.add(
      this.socketService.onIncomingCall().subscribe((data) => {
        const payload = data as SignalingPayload;
        this.incomingCall = payload;
        // Search for the chat if it's not the current one
        const chat = this.recentChats.find(c => c.threadId === payload.threadId);
        if (chat) this.selectedChat = chat;
        
        // Update status to ringing on backend
        if (payload.callId) {
          this.communicationService.updateCallStatus(payload.callId, 'ringing').subscribe();
        }
      })
    );
    this.subs.add(
      this.socketService.onCallEnded().subscribe((data) => {
        const payload = data as SignalingPayload;
        if (this.incomingCall && this.incomingCall.callId === payload.callId) {
          this.incomingCall = null;
        }
      })
    );


    this.loadMyThreads();
    this.listenForNewMessages();
    this.listenForPresenceChanges();
  }

  listenForNewMessages() {
    this.subs.add(
      this.socketService.onNewMessage().subscribe(() => {
        this.loadMyThreads();
      })
    );
  }

  listenForPresenceChanges() {
    this.subs.add(
      this.socketService.onUserStatusChanged().subscribe((data) => {
        // Find if this user is a participant in any of our recent chats
        // Note: Our current Chat interface doesn't store all participant IDs easily, 
        // but we can check the 'selectedChat' or refresh the list.
        // For a smoother experience, we'll just trigger a refresh or find the match.
        this.recentChats.forEach(chat => {
           // We'd need to know which participant this is. 
           // For now, let's just refresh the list to keep it simple and accurate.
           this.loadMyThreads();
        });
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  loadMyThreads() {
    this.subs.add(
      this.store.select(selectUser).subscribe(user => {
        if (!user) return;

        this.subs.add(
          this.communicationService.getThreadList().subscribe((threads) => {
            this.recentChats = threads.map(t => {
              return {
                id: t.threadId,
                threadId: t.threadId,
                name: t.title || 'Direct Message',
                participants: [], // Not needed for sidebar list mapping
                lastMessage: this.formatLastMessage(t.lastMessage?.content || ''),
                lastMessageSender: t.lastMessage?.senderName,
                unreadCount: t.unreadCount,
                time: t.lastMessage?.sentAt 
                  ? new Date(t.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '',
                active: t.threadId === this.activeThreadId,
                otherParticipantRole: t.participantRole
                  ? t.participantRole.charAt(0).toUpperCase() + t.participantRole.slice(1).toLowerCase()
                  : 'User',
                otherParticipantIsOnline: t.isOnline || false,
                otherParticipantLastSeenAt: t.lastSeenAt || undefined,
              };
            });

            if (this.recentChats.length > 0 && !this.selectedChat) {
              this.selectChat(this.recentChats[0]);
            }
          })
        );
      })
    );
  }

  selectChat(chat: Chat) {
    this.recentChats.forEach(c => c.active = false);
    chat.active = true;
    chat.unreadCount = 0; // Optimistically clear unread count
    this.selectedChat = chat;
    this.activeThreadId = chat.threadId;
    this.showSidebar = false;
    this.cdr.markForCheck();
  }

  onChatRead(threadId: string) {
    const chat = this.recentChats.find(c => c.threadId === threadId);
    if (chat && chat.unreadCount && chat.unreadCount > 0) {
      chat.unreadCount = 0;
      this.cdr.markForCheck();
    }
  }

  formatLastMessage(content: string): string {
    if (!content) return 'No messages yet';
    
    if (content.startsWith('[CALL_LOG]:')) {
      try {
        const jsonStr = content.replace('[CALL_LOG]:', '');
        const data = JSON.parse(jsonStr);
        const type = data.type === 'video' ? 'Video Call' : 'Voice Call';
        return `${type} • ${data.duration}`;
      } catch {
        return 'Call Ended';
      }
    }
    return content;
  }

  onRightClick(event: MouseEvent, threadId: string): void {
    event.preventDefault();
    event.stopPropagation();

    // Viewport edge detection
    const menuWidth = 160;
    const menuHeight = 60;
    const x = event.clientX + menuWidth > window.innerWidth
      ? event.clientX - menuWidth
      : event.clientX;
    const y = event.clientY + menuHeight > window.innerHeight
      ? event.clientY - menuHeight
      : event.clientY;

    this.contextMenu = { x, y, threadId };
  }

  @HostListener('document:click')
  @HostListener('document:contextmenu')
  closeContextMenu(): void {
    this.contextMenu = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.contextMenu = null;
    this.showConfirmDialog = false;
  }

  onDeleteClicked(): void {
    if (!this.contextMenu) return;
    this.pendingDeleteThreadId = this.contextMenu.threadId;
    this.contextMenu = null;
    this.showConfirmDialog = true;
  }

  onDeleteConfirmed(): void {
    if (!this.pendingDeleteThreadId) return;
    
    const threadId = this.pendingDeleteThreadId;
    this.showConfirmDialog = false;
    this.pendingDeleteThreadId = null;

    // Optimistic UI Update
    const previousThreads = [...this.recentChats];
    this.recentChats = this.recentChats.filter(t => t.threadId !== threadId);
    
    // If deleted thread was selected, deselect or select next
    if (this.selectedChat?.threadId === threadId) {
      this.selectedChat = this.recentChats.length > 0 ? this.recentChats[0] : null;
      this.activeThreadId = this.selectedChat?.threadId || null;
    }
    
    this.cdr.markForCheck();

    this.communicationService.deleteThread(threadId)
      .pipe(take(1))
      .subscribe({
        error: () => {
          // Rollback on failure
          this.recentChats = previousThreads;
          this.cdr.markForCheck();
          // Optionally show error toast here if a toast service is available
        }
      });
  }

  onDeleteCancelled(): void {
    this.showConfirmDialog = false;
    this.pendingDeleteThreadId = null;
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
        }).subscribe(() => {
          this.loadMyThreads(); // refresh list
        });
      }
    });
  }

  async startCall(type: 'audio' | 'video') {
    const chat = this.selectedChat;
    if (!chat || !chat.participants) return;

    // Find the other participant for 1v1
    // For now, we assume the first participant that isn't the current user is the target
    // We should ideally have the currentUser injected or available from state
    this.subs.add(
      this.store.select(selectUser).subscribe(user => {
        if (!user) return;
        
        const otherParticipant = chat.participants.find((p) => p.userId !== user.id);
        if (!otherParticipant) return;

        this.targetUserId = otherParticipant.userId;
        this.callType = type;
        this.isInitiator = true;

        this.communicationService.startCall({
          threadId: chat.threadId,
          type: type,
          projectId: this.projectId || undefined
        }).subscribe(session => {
          this.callId = session.id;
          this.isCalling = true;
          
          this.socketService.startCall({
            threadId: chat.threadId,
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
    
    this.callId = this.incomingCall.callId || null;
    this.callType = (this.incomingCall.type as 'audio' | 'video') || 'audio';
    this.targetUserId = this.incomingCall.initiatorId || null;
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
        targetUserId: this.incomingCall.initiatorId!
      });
      this.communicationService.updateCallStatus(this.incomingCall.callId, 'rejected').subscribe();
    }
    this.incomingCall = null;
  }

  endCall(summary?: { duration: string, type: string, endedAt: Date }) {
    if (summary && this.selectedChat && this.activeThreadId) {
      this.subs.add(
        this.store.select(selectUser).subscribe(user => {
          if (!user) return;
          
          const messageContent = `[CALL_LOG]:{"type":"${summary.type}","duration":"${summary.duration}"}`;
          this.socketService.sendMessage({
            threadId: this.activeThreadId!,
            senderId: user.id,
            content: messageContent
          });
        })
      );
    }
    this.isCalling = false;
    this.callId = null;
    this.isInitiator = false;
    this.targetUserId = null;
  }
}
