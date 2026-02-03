import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const RoleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userJson = localStorage.getItem('user');

  if (!userJson) {
    router.navigate(['/auth/login']);
    return false;
  }

  const user = JSON.parse(userJson);
  const expectedRoles = route.data['roles'] as string[];
  const userRole = user.role?.toLowerCase();

  if (expectedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
