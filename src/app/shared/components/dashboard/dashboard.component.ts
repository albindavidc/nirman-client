import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as LoginActions from '../../../features/auth/login/store/login.actions';
import * as LoginSelectors from '../../../features/auth/login/store/login.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-card">
        <div class="icon-wrapper">
          <mat-icon>dashboard</mat-icon>
        </div>
        <h1>Welcome to Nirman</h1>
        @if (user$ | async; as user) {
        <p class="welcome-text">
          Hello, {{ user.firstName }} {{ user.lastName }}!
        </p>
        <p class="role-badge">{{ user.role | titlecase }}</p>
        }
        <p class="description">
          Your dashboard is being set up. Check back soon!
        </p>
        <button mat-flat-button class="logout-btn" (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Logout</span>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--md-sys-color-background);
        padding: 20px;
      }

      .dashboard-card {
        background: var(--md-sys-color-surface-container-high);
        border-radius: 24px;
        padding: 48px;
        text-align: center;
        max-width: 400px;
        border: 1px solid var(--md-sys-color-outline-variant);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }

      .icon-wrapper {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          var(--md-sys-color-primary) 0%,
          var(--md-sys-color-secondary) 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;

        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: var(--md-sys-color-on-primary);
        }
      }

      h1 {
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--md-sys-color-primary);
        margin: 0 0 8px;
      }

      .welcome-text {
        font-size: 1rem;
        color: var(--md-sys-color-on-surface);
        margin: 0 0 8px;
      }

      .role-badge {
        display: inline-block;
        padding: 4px 16px;
        background: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
        border-radius: 16px;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 16px;
      }

      .description {
        font-size: 0.9rem;
        color: var(--md-sys-color-on-surface-variant);
        margin: 0 0 24px;
      }

      .logout-btn {
        background: var(--md-sys-color-error);
        color: var(--md-sys-color-on-error);
        border-radius: 24px;
        padding: 0 24px;
        height: 44px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
    `,
  ],
})
export class DashboardComponent {
  private readonly store = inject(Store);
  user$ = this.store.select(LoginSelectors.selectUser);

  logout(): void {
    this.store.dispatch(LoginActions.logout());
  }
}
