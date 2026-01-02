import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const VendorStatusGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userJson = localStorage.getItem('user');

  if (!userJson) {
    router.navigate(['/auth/login']);
    return false;
  }

  const user = JSON.parse(userJson);

  // If not a vendor, this guard doesn't apply (or arguably should block if strict vendor route)
  // Assuming this guard is used on vendor-only routes combined with RoleGuard, or standalone.
  // If used standalone, we should verify role is vendor first.
  if (user.role?.toLowerCase() !== 'vendor') {
    // If not a vendor, let RoleGuard user handle it or block.
    // For safety, if this guard is explicitly placed, we expect a vendor.
    // But if admin tries to access, maybe allow? Let's check requirement.
    // "expect for the vendor (for the vendor it should show the approval page if the application status is not updated)"
    // Implies this logic is specific to vendors.
    return true;
  }

  const status = user.vendorStatus?.toLowerCase();

  if (status === 'approved') {
    return true;
  }

  // Redirect based on status
  if (status === 'rejected' || status === 'blacklisted') {
    router.navigate(['/auth/application-rejected']);
  } else {
    // pending or undefined
    router.navigate(['/auth/pending-approval']);
  }

  return false;
};
