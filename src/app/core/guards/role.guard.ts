import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, switchMap, take } from 'rxjs/operators';
import {
  selectAuthHydrated,
  selectUser,
} from '../../features/auth/login/store/login.selectors';
import { getDefaultRouteForUser } from '../utils/auth-routing.util';

export const RoleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const store = inject(Store);

  return store.select(selectAuthHydrated).pipe(
    filter((hydrated) => hydrated),
    take(1),
    switchMap(() => store.select(selectUser)),
    take(1),
    map((user) => {
      // Fallback for rapid route races immediately after login
      if (!user) {
        const local = localStorage.getItem('user');
        if (local) {
          try {
            user = JSON.parse(local);
          } catch (e) {
            console.error('Error parsing user from localStorage', e);
          }
        }
      }

      if (!user) {
        router.navigate(['/']);
        return false;
      }

      const expectedRoles = route.data['roles'] as string[];
      const userRole = user.role?.trim()?.toLowerCase();

      if (!userRole || !expectedRoles) {
        router.navigate(['/']);
        return false;
      }

      if (expectedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
        return true;
      }

      router.navigate([getDefaultRouteForUser(user)]);
      return false;
    }),
  );
};
