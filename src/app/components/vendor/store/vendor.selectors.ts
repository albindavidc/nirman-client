import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VendorState } from './vendor.state';

export const selectVendorState =
  createFeatureSelector<VendorState>('vendorManagement');

export const selectVendors = createSelector(
  selectVendorState,
  (state) => state.vendors
);

export const selectSelectedVendor = createSelector(
  selectVendorState,
  (state) => state.selectedVendor
);

export const selectTotal = createSelector(
  selectVendorState,
  (state) => state.total
);

export const selectFilters = createSelector(
  selectVendorState,
  (state) => state.filters
);

export const selectStats = createSelector(selectVendorState, (state) => {
  const vendors = state.vendors;
  return {
    total: state.total,
    active: vendors.filter((v) => v.vendorStatus === 'approved').length,
    pending: vendors.filter((v) => v.vendorStatus === 'pending').length,
    rejected: vendors.filter((v) => v.vendorStatus === 'rejected').length,
    blacklisted: vendors.filter((v) => v.vendorStatus === 'blacklisted').length,
  };
});

export const selectIsLoading = createSelector(
  selectVendorState,
  (state) => state.isLoading
);

export const selectIsUpdating = createSelector(
  selectVendorState,
  (state) => state.isUpdating
);

export const selectError = createSelector(
  selectVendorState,
  (state) => state.error
);

export const selectVendorsByStatus = (status: string) =>
  createSelector(selectVendors, (vendors) =>
    vendors.filter((v) => v.vendorStatus === status)
  );
