import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userJson = localStorage.getItem('user');

  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user && user.role) {
        return true;
      }
    } catch {
      localStorage.removeItem('user');
    }
  }

  router.navigate(['/auth/login']);
  return false;
};

