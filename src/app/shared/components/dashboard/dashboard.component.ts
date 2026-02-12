import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as LoginActions from '../../../components/layouts/auth/login/store/login.actions';
import * as LoginSelectors from '../../../components/layouts/auth/login/store/login.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly store = inject(Store);
  user$ = this.store.select(LoginSelectors.selectUser);

  logout(): void {
    this.store.dispatch(LoginActions.logout());
  }
}
