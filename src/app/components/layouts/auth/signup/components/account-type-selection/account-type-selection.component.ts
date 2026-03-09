import { Component, inject } from '@angular/core';

import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  trigger,
  transition,
  style,
  animate,
  stagger,
  query,
} from '@angular/animations';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AccountTypeOption, AccountType } from '../../models/signup.models';
import * as SignupActions from '../../store/signup.actions';
import { ActivatedRoute } from '@angular/router';
import { AdminSignupComponent } from '../../../../../admin/auth/signup/admin-signup.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-type-selection',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, AdminSignupComponent],
  templateUrl: './account-type-selection.component.html',
  styleUrl: './account-type-selection.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(
          '600ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('staggerCards', [
      transition(':enter', [
        query(
          '.account-card',
          [
            style({ opacity: 0, transform: 'translateY(50px)' }),
            stagger(150, [
              animate(
                '500ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class AccountTypeSelectionComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isAdmin = false;

  accountTypes: AccountTypeOption[] = [
    {
      type: 'worker',
      title: 'Labor / Worker',
      subtitle: 'Field workers and tradespeople',
      icon: '👷',
      features: ['Clock in/out', 'View tasks', 'Track hours', 'Safety docs'],
    },
    {
      type: 'vendor',
      title: 'Vendor / Supplier',
      subtitle: 'Material suppliers & contractors',
      icon: '🏢',
      features: [
        'Submit bids',
        'Manage orders',
        'Upload invoices',
        'Track payments',
      ],
    },
    {
      type: 'supervisor',
      title: 'Site Supervisor',
      subtitle: 'Foremen & site managers',
      icon: '📋',
      features: [
        'Manage teams',
        'Approve time',
        'Track progress',
        'Report issues',
      ],
    },
  ];

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.isAdmin = params['role'] === 'admin';
    });
  }

  selectAccountType(type: AccountType): void {
    this.store.dispatch(SignupActions.selectAccountType({ accountType: type }));
  }
}
