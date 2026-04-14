import { Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthLogoComponent } from '../../auth-logo/auth-logo.component';
import { Store } from '@ngrx/store';
import * as LoginActions from '../../login/store/login.actions';

@Component({
  selector: 'app-pending-approval',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, AuthLogoComponent],
  templateUrl: './pending-approval.component.html',
  styleUrl: './pending-approval.component.scss',
})
export class PendingApprovalComponent {
  private readonly store = inject(Store);

  onLogout(): void {
    localStorage.clear();
    this.store.dispatch(LoginActions.logout());
  }
}
