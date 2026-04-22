import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SocketService } from '../../../../../core/services/socket.service';
import { CommunicationService } from '../../services/communication.service';
import { Store } from '@ngrx/store';
import * as LoginSelectors from '../../../../auth/login/store/login.selectors';
import { Subscription } from 'rxjs';
import { ChatSocketMessage } from '../../models/communication.models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, OnChanges {
  @Input() chat: { threadId: string; name: string; otherParticipantRole?: string } | null = null;
  @Output() videoCall = new EventEmitter<void>();
  @Output() voiceCall = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  newMessage = '';
  messages: { id: string; sender: 'me' | 'them'; text: string; time: string }[] = [];
  
  private socketService = inject(SocketService);
  private communicationService = inject(CommunicationService);
  private store = inject(Store);

  private currentUserId: string | null = null;
  private subs = new Subscription();

  ngOnInit() {
    this.subs.add(
      this.store.select(LoginSelectors.selectUser).subscribe(user => {
        this.currentUserId = user?.id || null;
      })
    );

    this.subs.add(
      this.socketService.onNewMessage().subscribe((data) => {
        const msg = data as ChatSocketMessage;
        if (msg.threadId === this.chat?.threadId) {
          const isMe = msg.senderId === this.currentUserId;
          // Avoid duplicating regular messages, but allow system messages like call logs
          if (isMe && !this.isCallLog(msg.content)) return; 
          
          this.messages.push({
            id: msg.id,
            sender: 'them',
            text: msg.content,
            time: new Date(msg.createdAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['chat'] && changes['chat'].currentValue) {
      const activeChat = changes['chat'].currentValue;
      this.loadMessages(activeChat.threadId);
      this.socketService.joinThread(activeChat.threadId);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  loadMessages(threadId: string) {
    this.subs.add(
      this.communicationService.getThreadMessages(threadId).subscribe(msgs => {
        this.messages = msgs.map(m => ({
          id: m.id,
          sender: m.senderId === this.currentUserId ? 'me' : 'them',
          text: m.content,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
      })
    );
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.currentUserId) return;

    this.socketService.sendMessage({
      threadId: this.chat?.threadId,
      senderId: this.currentUserId,
      content: this.newMessage
    });
    
    this.messages.push({
      id: Date.now().toString(),
      sender: 'me',
      text: this.newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    this.newMessage = '';
  }

  triggerVideoCall() {
    this.videoCall.emit();
  }

  triggerVoiceCall() {
    this.voiceCall.emit();
  }

  isCallLog(text: string): boolean {
    return text.startsWith('[CALL_LOG]:');
  }

  getCallData(text: string) {
    try {
      const jsonStr = text.replace('[CALL_LOG]:', '');
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  }

  goBack() {
    this.back.emit();
  }
}
