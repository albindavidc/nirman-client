import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  selectAuthHydrated,
  selectUser,
} from '../../features/auth/login/store/login.selectors';
import { filter, take, switchMap, map } from 'rxjs/operators';

export const VendorStatusGuard: CanActivateFn = () => {
  const router = inject(Router);
  const store = inject(Store);

  return store.select(selectAuthHydrated).pipe(
    filter((hydrated) => hydrated),
    take(1),
    switchMap(() => store.select(selectUser)),
    take(1),
    map((user) => {
      if (!user) {
        router.navigate(['/']);
        return false;
      }

      // This guard only applies to vendors
      if (user.role?.toLowerCase() !== 'vendor') {
        return true;
      }

      // Check for vendor status in both nested and potential flattened structures
      const rawStatus = user.vendor?.vendorStatus || user.vendorStatus;
      const status = (rawStatus || '').toString().trim().toLowerCase();



      if (status === 'approved') {
        return true;
      }

      if (status === 'rejected' || status === 'blacklisted') {
        router.navigate(['/auth/application-rejected']);
      } else {
        // pending or undefined
        router.navigate(['/auth/pending-approval']);
      }

      return false;
    }),
  );
};
