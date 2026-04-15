export enum MaterialRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
}

export enum MaterialRequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface MaterialRequestItemResponseDto {
  id: string;
  material_id: string;
  material_name: string;
  material_code: string;
  quantity_requested: number;
  unit: string;
  purpose: string;
}

export interface MaterialRequestResponseDto {
  id: string;
  request_number: string;
  project_id: string;
  project_name: string;
  requested_by: string;
  requested_by_name: string;
  items: MaterialRequestItemResponseDto[];
  priority: MaterialRequestPriority;
  delivery_location: string;
  required_date: string;
  status: MaterialRequestStatus;
  approved_by?: string;
  approved_at?: string;
  approval_comments?: string;
  rejection_reason?: string;
  converted_to_po: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedMaterialRequestResponseDto {
  data: MaterialRequestResponseDto[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface MaterialApprovalStatsDto {
  totalRequests: number;
  pendingReview: number;
  approved: number;
  inProgress: number;
  totalValue: number;
}

export interface GetMaterialRequestDto {
  page?: number;
  limit?: number;
  projectId?: string;
  status?: MaterialRequestStatus;
}
