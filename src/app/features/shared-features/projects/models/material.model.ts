export interface Material {
  id: string;
  projectId: string;
  name: string;
  code: string;
  category: string;
  description?: string;
  specifications?: string;
  currentStock: number;
  unit: string;
  unitPrice?: number;
  reorderLevel?: number;
  storageLocation?: string;
  preferredSupplierId?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'requested';
  createdAt: string;
  updatedAt: string;
  // UI extended fields
  totalReceived?: number;
  totalUsed?: number;
  wastage?: number;
  createdByName?: string;
}

export interface CreateMaterialDto {
  name: string;
  code: string;
  category: string;
  description?: string;
  specifications?: string;
  unit: string;
  unitPrice?: number;
  reorderLevel?: number;
  storageLocation?: string;
  preferredSupplierId?: string;
}

export interface MaterialStats {
  totalItems: number;
  totalValue: number;
  sufficientStock: number;
  lowStock: number;
  criticalStock: number;
  pendingDeliveries: number;
  // upcomingRequests?
}

export interface MaterialTransaction {
  id: string;
  materialId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  referenceId?: string;
  performedBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  status?: 'delivered' | 'pending' | 'cancelled'; // UI field
}

export interface CreateMaterialTransactionDto {
  type: 'IN' | 'OUT';
  quantity: number;
  referenceId?: string;
  notes?: string;
  unitPrice?: number;
}

export interface MaterialRequestItem {
  materialId: string;
  materialName?: string;
  quantityRequested: number;
  unit: string;
  purpose?: string;
}

export interface MaterialRequest {
  id: string;
  requestNumber: string;
  projectId: string;
  requestedBy: string;
  items: MaterialRequestItem[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deliveryLocation?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  requiredDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';
  approvedBy?: string;
  approvedAt?: string;
  approvalComments?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialRequestDto {
  projectId: string;
  items: MaterialRequestItem[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  deliveryLocation?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  requiredDate: string;
}
