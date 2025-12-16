import { createReducer, on } from '@ngrx/store';
import { initialVendorState } from './vendor.state';
import * as VendorActions from './vendor.actions';

export const vendorReducer = createReducer(
  initialVendorState,

  // Load Vendors
  on(VendorActions.loadVendors, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(VendorActions.loadVendorsSuccess, (state, { vendors, total }) => ({
    ...state,
    vendors,
    total,
    isLoading: false,
  })),

  on(VendorActions.loadVendorsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Load Single Vendor
  on(VendorActions.loadVendor, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(VendorActions.loadVendorSuccess, (state, { vendor }) => ({
    ...state,
    selectedVendor: vendor,
    isLoading: false,
  })),

  on(VendorActions.loadVendorFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Update Vendor
  on(VendorActions.updateVendor, (state) => ({
    ...state,
    isUpdating: true,
    error: null,
  })),

  on(VendorActions.approveVendor, (state) => ({
    ...state,
    isUpdating: true,
    error: null,
  })),

  on(VendorActions.rejectVendor, (state) => ({
    ...state,
    isUpdating: true,
    error: null,
  })),

  on(VendorActions.updateVendorSuccess, (state, { vendor }) => ({
    ...state,
    vendors: state.vendors.map((v) => (v.id === vendor.id ? vendor : v)),
    selectedVendor:
      state.selectedVendor?.id === vendor.id ? vendor : state.selectedVendor,
    isUpdating: false,
  })),

  on(VendorActions.updateVendorFailure, (state, { error }) => ({
    ...state,
    isUpdating: false,
    error,
  })),

  // Create Vendor
  on(VendorActions.createVendor, (state) => ({
    ...state,
    isUpdating: true,
    error: null,
  })),

  on(VendorActions.createVendorSuccess, (state, { vendor }) => ({
    ...state,
    vendors: [vendor, ...state.vendors], // Add to top
    total: state.total + 1,
    isUpdating: false,
  })),

  on(VendorActions.createVendorFailure, (state, { error }) => ({
    ...state,
    isUpdating: false,
    error,
  })),

  // Stats
  on(VendorActions.loadVendorStatsSuccess, (state, stats) => ({
    ...state,
    stats,
  })),

  // UI
  on(VendorActions.setSelectedVendor, (state, { vendor }) => ({
    ...state,
    selectedVendor: vendor,
  })),

  on(VendorActions.setFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters },
  })),

  on(VendorActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);
