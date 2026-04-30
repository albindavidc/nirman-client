export interface InvoicePrepItemResponseDto {
  materialId: string;
  materialName: string;
  materialCode?: string;
  orderedQuantity: number;
  acceptedQuantity: number;
  unitPrice: number;
  taxRate: number;
  recommendedTotal: number;
}

export interface InvoicePrepResponseDto {
  poId: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  projectName?: string;
  supervisorName?: string;
  locationName?: string; // New: For project site identification
  locationLink?: string; // New: For Google Maps link
  poIssuedAt?: string;    // Updated to string for JSON compatibility
  currency: string;
  grnReferences: string[];
  billableItems: InvoicePrepItemResponseDto[];
  recommendedInvoiceTotal: number;
}

export interface InvoiceBillableItem {
  materialId: string;
  materialName: string;
  materialCode?: string;
  orderedQuantity: number;
  acceptedQuantity: number;
  unitPrice: number;
  taxRate: number;
  totalItemCost?: number;
  recommendedTotal?: number;
}

export interface CreateInvoiceItemDto {
  materialId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalItemCost: number;
}

export interface CreateInvoiceDto {
  invoiceNumber: string;
  poId: string;
  vendorId: string;
  currency: string;
  dueDate: Date | string;
  items: CreateInvoiceItemDto[];
  attachments: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }[];
  subTotal?: number;
  taxAmount?: number;
  totalAmount?: number;
}

export interface InvoiceItemResponseDto {
  id: string;
  materialId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalItemCost: number;
}

export interface InvoiceAttachmentResponseDto {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface InvoiceResponseDto {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  poId: string;
  amount: number;
  tax: number;
  total: number;
  currency: string;
  dueDate: string;
  status: string;
  vendorName?: string;
  projectName?: string;
  items?: InvoiceItemResponseDto[];
  attachments?: InvoiceAttachmentResponseDto[];
  createdAt: string;
  updatedAt: string;
}
