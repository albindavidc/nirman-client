import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, switchMap } from 'rxjs/operators';
import { VendorService } from '../services/vendor.service';
import { NotificationService } from '../../../core/services/notification.service';
import * as VendorActions from './vendor.actions';

@Injectable()
export class VendorEffects {
  private readonly actions$ = inject(Actions);
  private readonly vendorService = inject(VendorService);
  private readonly notification = inject(NotificationService);

  loadVendors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VendorActions.loadVendors),
      switchMap(({ filters }) =>
        this.vendorService.getVendors(filters).pipe(
          map((response) =>
            VendorActions.loadVendorsSuccess({
              vendors: response.vendors,
              total: response.total,
            }),
          ),
          catchError((error) =>
            of(
              VendorActions.loadVendorsFailure({
                error: error.error?.message || 'Failed to load vendors',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loadVendor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VendorActions.loadVendor),
      switchMap(({ id }) =>
        this.vendorService.getVendorById(id).pipe(
          map((vendor) => VendorActions.loadVendorSuccess({ vendor })),
          catchError((error) =>
            of(
              VendorActions.loadVendorFailure({
                error: error.error?.message || 'Failed to load vendor',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  updateVendor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VendorActions.updateVendor),
      exhaustMap(({ id, data }) =>
        this.vendorService.updateVendor(id, data).pipe(
          map((vendor) => {
            this.notification.success('Vendor updated successfully');
            return VendorActions.updateVendorSuccess({ vendor });
          }),
          catchError((error) => {
            this.notification.error(
              error.error?.message || 'Failed to update vendor',
            );
            return of(
              VendorActions.updateVendorFailure({
                error: error.error?.message || 'Failed to update vendor',
              }),
            );
          }),
        ),
      ),
    ),
  );

  createVendor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VendorActions.createVendor),
      exhaustMap(({ data }) =>
        this.vendorService.createVendor(data).pipe(
          map((vendor) => {
            this.notification.success('Vendor created successfully');
            return VendorActions.createVendorSuccess({
              vendor: vendor,
            });
          }),
          catchError((error) => {
            this.notification.error(
              error.error?.message || 'Failed to create vendor',
            );
            return of(
              VendorActions.createVendorFailure({
                error: error.error?.message || 'Failed to create vendor',
              }),
            );
          }),
        ),
      ),
    ),
  );

  approveVendor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VendorActions.approveVendor),
      exhaustMap(({ id }) =>
        this.vendorService.approveVendor(id).pipe(
          map((vendor) => {
            this.notification.success('Vendor approved successfully');
            return VendorActions.updateVendorSuccess({ vendor });
          }),
          catchError((error) => {
            this.notification.error(
              error.error?.message || 'Failed to approve vendor',
            );
            return of(
              VendorActions.updateVendorFailure({
                error: error.error?.message || 'Failed to approve vendor',
              }),
            );
          }),
        ),
      ),
    ),
  );

  rejectVendor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VendorActions.rejectVendor),
      exhaustMap(({ id, reason }) =>
        this.vendorService.rejectVendor(id, reason).pipe(
          map((vendor) => {
            this.notification.success('Vendor rejected');
            return VendorActions.updateVendorSuccess({ vendor });
          }),
          catchError((error) => {
            this.notification.error(
              error.error?.message || 'Failed to reject vendor',
            );
            return of(
              VendorActions.updateVendorFailure({
                error: error.error?.message || 'Failed to reject vendor',
              }),
            );
          }),
        ),
      ),
    ),
  );

  blacklistVendor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VendorActions.blacklistVendor),
      exhaustMap(({ id }) =>
        this.vendorService.blacklistVendor(id).pipe(
          map((vendor) => {
            this.notification.success('Vendor blacklisted');
            return VendorActions.updateVendorSuccess({ vendor });
          }),
          catchError((error) => {
            this.notification.error(
              error.error?.message || 'Failed to blacklist vendor',
            );
            return of(
              VendorActions.updateVendorFailure({
                error: error.error?.message || 'Failed to blacklist vendor',
              }),
            );
          }),
        ),
      ),
    ),
  );

  unblacklistVendor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VendorActions.unblacklistVendor),
      exhaustMap(({ id }) =>
        this.vendorService.unblacklistVendor(id).pipe(
          map((vendor) => {
            this.notification.success('Vendor unblacklisted');
            return VendorActions.updateVendorSuccess({ vendor });
          }),
          catchError((error) => {
            this.notification.error(
              error.error?.message || 'Failed to unblacklist vendor',
            );
            return of(
              VendorActions.updateVendorFailure({
                error: error.error?.message || 'Failed to unblacklist vendor',
              }),
            );
          }),
        ),
      ),
    ),
  );

  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VendorActions.loadVendorStats),
      switchMap(() =>
        this.vendorService.getVendorStats().pipe(
          map((stats) => VendorActions.loadVendorStatsSuccess(stats)),
          catchError((error) =>
            of(
              VendorActions.loadVendorStatsFailure({
                error: error.error?.message || 'Failed to load stats',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
