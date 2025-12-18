import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { Store } from '@ngrx/store';
import { LayoutService } from '../../services/layout.service';
import * as LoginSelectors from '../../../features/auth/login/store/login.selectors';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  layoutService = inject(LayoutService);
  private readonly store = inject(Store);

  user$ = this.store.select(LoginSelectors.selectUser);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    {
      label: 'Project Management',
      icon: 'folder_open',
      children: [
        { label: 'Projects', icon: 'work', route: '/projects' },
        { label: 'Project Members', icon: 'group', route: '/project-members' },
        { label: 'Tasks', icon: 'task', route: '/tasks' },
      ],
    },
    {
      label: 'Workforce & Labor',
      icon: 'engineering',
      children: [
        { label: 'Workers', icon: 'people', route: '/workers' },
        { label: 'Attendance', icon: 'schedule', route: '/attendance' },
      ],
    },
    {
      label: 'Finance & Procurement',
      icon: 'attach_money',
      children: [
        { label: 'Budget', icon: 'account_balance_wallet', route: '/budget' },
        { label: 'Expenses', icon: 'receipt_long', route: '/expenses' },
        {
          label: 'Vendor Management',
          icon: 'storefront',
          route: '/vendor-management',
        },
        { label: 'Material Catalog', icon: 'inventory_2', route: '/materials' },
        {
          label: 'Procurement Request',
          icon: 'shopping_cart',
          route: '/procurement',
        },
        {
          label: 'Purchase Order',
          icon: 'description',
          route: '/purchase-orders',
        },
        { label: 'Payment Invoices', icon: 'receipt', route: '/invoices' },
        {
          label: 'Vendor Payments',
          icon: 'payments',
          route: '/vendor-payments',
        },
        {
          label: 'Goods Receipts',
          icon: 'inventory',
          route: '/goods-receipts',
        },
        {
          label: 'AI Cost Forecast',
          icon: 'auto_graph',
          route: '/ai-forecast',
        },
      ],
    },
  ];

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName?.charAt(0) || ''}${
      lastName?.charAt(0) || ''
    }`.toUpperCase();
  }
}
