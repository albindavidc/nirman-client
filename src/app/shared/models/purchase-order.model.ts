export interface PurchaseOrderItemDto {
  id?: string;
  materialId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface CreatePurchaseOrderDto {
  id: string;
  projectId: string;
  vendorId: string;
  materialRequestId?: string;
  items: PurchaseOrderItemDto[];
  expectedDeliveryDate: Date | string;
  currency: string;
  termsCondition?: string;
}

export interface PurchaseOrderResponseDto {
  id: string;
  poNumber: string;
  projectId: string;
  vendorId: string;
  vendorName?: string;
  materialRequestId: string;
  currency: string;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  deliveryStatus: string;
  paymentStatus: string;
  status: string;
  issuedAt: string;
  issuedBy: string;
  expectedDeliveryDate: string;
  termsAndConditions: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderItemResponseDto[];
}

export interface PurchaseOrderItemResponseDto {
  id: string;
  materialId: string;
  materialName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalItemCost: number;
}
