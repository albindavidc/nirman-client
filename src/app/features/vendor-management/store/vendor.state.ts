import { Vendor, VendorFilters } from '../models/vendor.models';

export interface VendorState {
  vendors: Vendor[];
  selectedVendor: Vendor | null;
  total: number;
  filters: VendorFilters;
  stats: {
    total: number;
    active: number;
    avgRating: number;
    onTimeDelivery: number;
  };
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

export const initialVendorState: VendorState = {
  vendors: [],
  selectedVendor: null,
  total: 0,
  filters: {
    page: 1,
    limit: 10,
  },
  stats: {
    total: 0,
    active: 0,
    avgRating: 0,
    onTimeDelivery: 0,
  },
  isLoading: false,
  isUpdating: false,
  error: null,
};
