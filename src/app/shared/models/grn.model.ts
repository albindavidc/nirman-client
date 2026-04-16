export interface GrnItemResponseDto {
  id: string;
  grnId: string;
  materialId: string;
  materialName?: string;
  quantityRecieved: number;
  quantityAccepted: number;
  quantityRejected: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GrnResponseDto {
  id: string;
  grnNumber: string;
  poId: string;
  projectId: string;
  inspectedBy: string;
  inspectionStatus: 'pending' | 'partially_accepted' | 'accepted' | 'rejected';
  inspectionNotes?: string;
  recievedAt: string;
  deliveryChallanNumber?: string;
  items: GrnItemResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGrnItemDto {
  materialId: string;
  quantityRecieved: number;
  quantityAccepted: number;
  quantityRejected: number;
  rejectionReason?: string;
}

export interface CreateGrnDto {
  id: string;
  poId: string;
  projectId: string;
  inspectedBy: string;
  inspectionStatus: 'pending' | 'partially_accepted' | 'accepted' | 'rejected';
  inspectionNotes?: string;
  recievedAt: string;
  deliveryChallanNumber?: string;
  items: CreateGrnItemDto[];
}
