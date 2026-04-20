import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthHydrated, selectUser } from '../../features/auth/login/store/login.selectors';
import { filter, take, switchMap, map } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = () => {
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

      if (user && user.role) {
        return true;
      }

      router.navigate(['/']);
      return false;
    })
  );
};

