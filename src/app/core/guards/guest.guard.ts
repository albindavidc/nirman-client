import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthHydrated, selectUser } from '../../features/auth/login/store/login.selectors';
import { getDefaultRouteForUser } from '../utils/auth-routing.util';
import { filter, take, switchMap, map } from 'rxjs/operators';

export const GuestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const store = inject(Store);

  return store.select(selectAuthHydrated).pipe(
    filter((hydrated) => hydrated),
    take(1),
    switchMap(() => store.select(selectUser)),
    take(1),
    map((user) => {
      if (!user) {
        return true;
      }

      // If they are logged in and hydrated, explicitly redirect to their dashboard
      const targetRoute = getDefaultRouteForUser(user);
      router.navigate([targetRoute]);
      return false;
    })
  );
};
