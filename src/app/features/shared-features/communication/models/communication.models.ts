export interface ThreadParticipantDto {
  id: string;
  userId: string;
  role: string;
  name?: string;
  email?: string;
  isOnline?: boolean;
  lastSeenAt?: string;
  joinedAt: string;
  isActive: boolean;
}

export interface ChatThreadResponseDto {
  id: string;
  projectId: string;
  title: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  participants: ThreadParticipantDto[];
}

export interface LastMessagePreview {
  content: string;
  senderName: string;
  sentAt: string | Date;
}

export interface ChatThreadListItem {
  threadId: string;
  title: string;
  participantRole: string;
  unreadCount: number;
  lastMessage: LastMessagePreview | null;
  isOnline?: boolean;
  lastSeenAt?: string | null;
  otherParticipantId?: string;
}

export interface CreateChatThreadDto {
  projectId?: string;
  title: string;
  participants: {
    userId: string;
    role: string;
  }[];
}

export interface MessageAttachmentDto {
  id: string;
  url: string;
  type: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface MessageReadReceiptDto {
  id: string;
  userId: string;
  readAt: string;
}

export interface ChatMessageResponseDto {
  id: string;
  threadId: string;
  senderId: string;
  senderName?: string;
  senderEmail?: string;
  content: string;
  replyToId?: string;
  attachments?: MessageAttachmentDto[];
  readReceipts?: MessageReadReceiptDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CallSessionResponseDto {
  id: string;
  threadId: string;
  projectId: string;
  type: string;
  status: string;
  initiatorId: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  createdAt: string;
}

export interface SignalingPayload {
  callId: string;
  threadId?: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  type?: 'audio' | 'video';
  targetUserId?: string;
  initiatorId?: string;
}

export interface ChatSocketMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName?: string;
  senderEmail?: string;
  content: string;
  createdAt: string;
}
