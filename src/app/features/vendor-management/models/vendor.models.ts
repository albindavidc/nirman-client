export interface Vendor {
  id: string;
  userId: string;
  companyName: string;
  registrationNumber: string;
  taxNumber?: string;
  yearsInBusiness?: number;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  productsServices: string[];
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  vendorStatus: VendorStatus;
  createdAt: string;
  updatedAt: string;
  // Computed/Display fields
  vendorCode?: string;
  rating?: number;
  orders?: number;
  onTimeDelivery?: number;
  // User info
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'blacklisted';

export interface VendorListResponse {
  vendors: Vendor[];
  total: number;
  page: number;
  limit: number;
}

export interface VendorFilters {
  status?: VendorStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UpdateVendorDto {
  companyName?: string;
  registrationNumber?: string;
  taxNumber?: string;
  yearsInBusiness?: number;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  productsServices?: string[];
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  vendorStatus?: VendorStatus;
}
