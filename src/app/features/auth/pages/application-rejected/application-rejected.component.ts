import { Component, OnInit, inject } from '@angular/core';

import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthLogoComponent } from '../../shared/auth-logo/auth-logo.component';
import { VendorService } from '../../../vendor-management/services/vendor.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Store } from '@ngrx/store';
import * as LoginActions from '../../login/store/login.actions';

@Component({
  selector: 'app-application-rejected',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, AuthLogoComponent],
  templateUrl: './application-rejected.component.html',
  styleUrl: './application-rejected.component.scss',
})
export class ApplicationRejectedComponent implements OnInit {
  rejectionReason: string | null = null;
  vendorId: string | null = null;
  isSubmitting = false;

  private readonly vendorService = inject(VendorService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private readonly store = inject(Store); // Inject Store for logout

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.rejectionReason = user.rejectionReason;
        this.vendorId = user.vendorId; // Get vendorId specifically
      } catch (e) {
        console.error('Error parsing user from local storage', e);
      }
    }
  }

  onRequestRecheck(): void {
    if (!this.vendorId) {
      this.notification.error('Vendor ID missing. Please login again.');
      return;
    }

    this.isSubmitting = true;
    this.vendorService.requestRecheck(this.vendorId).subscribe({
      next: (updatedVendor) => {
        this.notification.success('Re-check request submitted successfully');

        // Update local storage to reflect pending status
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.vendorStatus = 'pending';
          user.rejectionReason = null;
          localStorage.setItem('user', JSON.stringify(user));
        }

        this.router.navigate(['/auth/pending-approval']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.notification.error(
          error.error?.message || 'Failed to submit re-check request',
        );
      },
    });
  }

  onLogout(): void {
    // Clear local storage immediately to prevent GuestGuard loops
    localStorage.removeItem('user');
    this.store.dispatch(LoginActions.logout());
  }
}
