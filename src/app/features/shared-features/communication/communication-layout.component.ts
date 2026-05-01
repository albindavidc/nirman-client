import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../../core/services/socket.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChatComponent } from './components/chat/chat.component';
import { ChatContextMenuComponent } from './components/chat-context-menu/chat-context-menu.component';
import { DeleteChatDialogComponent } from './components/delete-chat-dialog/delete-chat-dialog.component';
import { Store } from '@ngrx/store';
import { CommunicationService } from './services/communication.service';
import { Subscription, take } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HostListener } from '@angular/core';
import { NewChatModalComponent } from './components/new-chat-modal/new-chat-modal.component';
import { selectUser } from '../../auth/login/store/login.selectors';
import { ThreadParticipantDto } from './models/communication.models';
import { CallStateService } from '../../../core/services/call-state.service';

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
  otherParticipantId?: string;
  type?: string;
}

@Component({
  selector: 'app-communication-layout',
  standalone: true,
  imports: [
    CommonModule,
    ChatComponent,
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
  private callState = inject(CallStateService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  activeThreadId: string | null = null;
  searchQuery = '';

  recentChats: Chat[] = [];
  selectedChat: Chat | null = null;
  showSidebar = true;
  projectId: string | null = null;

  // Context Menu & Deletion
  contextMenu: { x: number; y: number; threadId: string } | null = null;
  showConfirmDialog = false;
  pendingDeleteThreadId: string | null = null;

  private subs = new Subscription();

  ngOnInit() {
    this.loadMyThreads();
    this.listenForNewMessages();
    this.listenForPresenceChanges();
  }

  listenForNewMessages() {
    this.subs.add(
      this.socketService.onNewMessage().subscribe(() => {
        this.loadMyThreads();
      }),
    );
  }

  listenForPresenceChanges() {
    this.subs.add(
      this.socketService.onUserStatusChanged().subscribe((data) => {
        // Find if this user is a participant in any of our recent chats
        // Note: Our current Chat interface doesn't store all participant IDs easily,
        // but we can check the 'selectedChat' or refresh the list.
        // For a smoother experience, we'll just trigger a refresh or find the match.
        this.recentChats.forEach((chat) => {
          // We'd need to know which participant this is.
          // For now, let's just refresh the list to keep it simple and accurate.
          this.loadMyThreads();
        });
      }),
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  loadMyThreads() {
    this.subs.add(
      this.store.select(selectUser).subscribe((user) => {
        if (!user) return;

        this.subs.add(
          this.communicationService.getThreadList().subscribe((threads) => {
            this.recentChats = threads.map((t) => {
              return {
                id: t.threadId,
                threadId: t.threadId,
                name: t.title || 'Direct Message',
                participants: [], // Not needed for sidebar list mapping
                lastMessage: this.formatLastMessage(
                  t.lastMessage?.content || '',
                ),
                lastMessageSender: t.lastMessage?.senderName,
                unreadCount: t.unreadCount,
                time: t.lastMessage?.sentAt
                  ? new Date(t.lastMessage.sentAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '',
                active: t.threadId === this.activeThreadId,
                otherParticipantRole: t.participantRole
                  ? t.participantRole.charAt(0).toUpperCase() +
                    t.participantRole.slice(1).toLowerCase()
                  : 'User',
                otherParticipantIsOnline: t.isOnline || false,
                otherParticipantLastSeenAt: t.lastSeenAt || undefined,
                otherParticipantId: t.otherParticipantId,
              };
            });

            if (this.recentChats.length > 0 && !this.selectedChat) {
              this.selectChat(this.recentChats[0]);
            }
          }),
        );
      }),
    );
  }

  selectChat(chat: Chat) {
    this.recentChats.forEach((c) => (c.active = false));
    chat.active = true;
    chat.unreadCount = 0; // Optimistically clear unread count
    this.selectedChat = chat;
    this.activeThreadId = chat.threadId;
    this.showSidebar = false;
    this.cdr.markForCheck();
  }

  onChatRead(threadId: string) {
    const chat = this.recentChats.find((c) => c.threadId === threadId);
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
    const x =
      event.clientX + menuWidth > window.innerWidth
        ? event.clientX - menuWidth
        : event.clientX;
    const y =
      event.clientY + menuHeight > window.innerHeight
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
    this.recentChats = this.recentChats.filter((t) => t.threadId !== threadId);

    // If deleted thread was selected, deselect or select next
    if (this.selectedChat?.threadId === threadId) {
      this.selectedChat =
        this.recentChats.length > 0 ? this.recentChats[0] : null;
      this.activeThreadId = this.selectedChat?.threadId || null;
    }

    this.cdr.markForCheck();

    this.communicationService
      .deleteThread(threadId)
      .pipe(take(1))
      .subscribe({
        error: () => {
          // Rollback on failure
          this.recentChats = previousThreads;
          this.cdr.markForCheck();
          // Optionally show error toast here if a toast service is available
        },
      });
  }

  onDeleteCancelled(): void {
    this.showConfirmDialog = false;
    this.pendingDeleteThreadId = null;
  }

  openNewChatModal() {
    const dialogRef = this.dialog.open(NewChatModalComponent, {
      width: '450px',
      panelClass: 'dark-dialog',
    });

    dialogRef.afterClosed().subscribe((partner) => {
      if (partner) {
        this.communicationService
          .createThread({
            title: `DM with ${partner.name}`,
            participants: [{ userId: partner.userId, role: partner.type }],
          })
          .subscribe(() => {
            this.loadMyThreads(); // refresh list
          });
      }
    });
  }

  async startCall(type: 'audio' | 'video') {
    if (!this.selectedChat) return;
    this.callState.startCall(
      this.selectedChat,
      type,
      this.projectId || undefined,
    );
  }
}
