import { createAction, props } from '@ngrx/store';
import {
  Vendor,
  VendorFilters,
  UpdateVendorDto,
} from '../models/vendor.models';

// Load Vendors
export const loadVendors = createAction(
  '[Vendor] Load Vendors',
  props<{ filters?: VendorFilters }>()
);

export const loadVendorsSuccess = createAction(
  '[Vendor] Load Vendors Success',
  props<{ vendors: Vendor[]; total: number }>()
);

export const loadVendorsFailure = createAction(
  '[Vendor] Load Vendors Failure',
  props<{ error: string }>()
);

// Load Single Vendor
export const loadVendor = createAction(
  '[Vendor] Load Vendor',
  props<{ id: string }>()
);

export const loadVendorSuccess = createAction(
  '[Vendor] Load Vendor Success',
  props<{ vendor: Vendor }>()
);

export const loadVendorFailure = createAction(
  '[Vendor] Load Vendor Failure',
  props<{ error: string }>()
);

// Create Vendor
export const createVendor = createAction(
  '[Vendor] Create Vendor',
  props<{ data: any }>() // Using any for simplified DTO, in real app use interface
);

export const createVendorSuccess = createAction(
  '[Vendor] Create Vendor Success',
  props<{ vendor: Vendor }>()
);

export const createVendorFailure = createAction(
  '[Vendor] Create Vendor Failure',
  props<{ error: string }>()
);

// Update Vendor
export const updateVendor = createAction(
  '[Vendor] Update Vendor',
  props<{ id: string; data: UpdateVendorDto }>()
);

export const updateVendorSuccess = createAction(
  '[Vendor] Update Vendor Success',
  props<{ vendor: Vendor }>()
);

export const updateVendorFailure = createAction(
  '[Vendor] Update Vendor Failure',
  props<{ error: string }>()
);

// Approve/Reject
export const approveVendor = createAction(
  '[Vendor] Approve Vendor',
  props<{ id: string }>()
);

export const rejectVendor = createAction(
  '[Vendor] Reject Vendor',
  props<{ id: string }>()
);

// Load Stats
export const loadVendorStats = createAction('[Vendor] Load Stats');

export const loadVendorStatsSuccess = createAction(
  '[Vendor] Load Stats Success',
  props<{
    total: number;
    active: number;
    avgRating: number;
    onTimeDelivery: number;
  }>()
);

export const loadVendorStatsFailure = createAction(
  '[Vendor] Load Stats Failure',
  props<{ error: string }>()
);

// UI Actions
export const setSelectedVendor = createAction(
  '[Vendor] Set Selected Vendor',
  props<{ vendor: Vendor | null }>()
);

export const setFilters = createAction(
  '[Vendor] Set Filters',
  props<{ filters: VendorFilters }>()
);

export const clearError = createAction('[Vendor] Clear Error');
