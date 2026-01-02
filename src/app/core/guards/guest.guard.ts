import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const GuestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userJson = localStorage.getItem('user');

  if (userJson) {
    const user = JSON.parse(userJson);
    const role = user.role?.toLowerCase();

    let targetRoute = '/dashboard';

    if (role === 'vendor') {
      const status = user.vendorStatus?.toLowerCase();
      if (status === 'approved') {
        targetRoute = '/dashboard/vendor';
      } else if (status === 'rejected' || status === 'blacklisted') {
        targetRoute = '/auth/application-rejected';
      } else {
        targetRoute = '/auth/pending-approval';
      }
    } else if (role === 'admin') {
      targetRoute = '/dashboard';
    } else if (role === 'supervisor') {
      targetRoute = '/dashboard/supervisor';
    } else if (role === 'worker') {
      targetRoute = '/dashboard/worker';
    }

    router.navigate([targetRoute]);
    return false;
  }

  return true;
};
