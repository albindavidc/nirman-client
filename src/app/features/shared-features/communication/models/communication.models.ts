export interface ChatThreadResponseDto {
  id: string;
  projectId: string;
  title: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  participants: any[]; // Adjust to ThreadParticipantDto if needed
}

export interface ChatMessageResponseDto {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  replyToId?: string;
  attachments?: any[]; // Adjust if needed
  readReceipts?: any[];
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
