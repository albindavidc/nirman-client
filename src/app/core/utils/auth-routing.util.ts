import { UserProfile } from '../../shared/models/profile.model';

export function normalizeRole(role?: string | null): string | null {
  if (!role) {
    return null;
  }

  return role.toString().trim().toLowerCase();
}

export function getDefaultRouteForUser(user: UserProfile | null): string {
  if (!user) {
    return '/';
  }

  const role = normalizeRole(user.role as unknown as string | null);
  if (!role) {
    return '/';
  }

  if (role === 'vendor') {
    const status = normalizeRole(
      user.vendor?.vendorStatus as unknown as string | null,
    );

    if (status === 'approved') {
      return '/vendor/dashboard';
    }

    if (status === 'rejected' || status === 'blacklisted') {
      return '/auth/application-rejected';
    }

    return '/auth/pending-approval';
  }

  if (role === 'admin') {
    return '/admin/dashboard';
  }

  if (role === 'supervisor') {
    return '/supervisor/dashboard';
  }

  if (role === 'worker') {
    return '/worker/tasks';
  }

  return '/';
}
