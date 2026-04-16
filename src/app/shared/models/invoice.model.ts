export interface InvoicePrepItemResponseDto {
  materialId: string;
  materialName: string;
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
  currency: string;
  grnReferences: string[];
  billableItems: InvoicePrepItemResponseDto[];
  recommendedInvoiceTotal: number;
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
  createdAt: string;
  updatedAt: string;
}
