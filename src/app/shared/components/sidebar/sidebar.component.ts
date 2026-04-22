import { AsyncPipe, CommonModule, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { ConfigService } from '../../../core/services/config.service';
import { LayoutService } from '../../../core/services/layout.service';
import * as LoginSelectors from '../../../features/auth/login/store/login.selectors';

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
    TitleCasePipe,
    AsyncPipe,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  layoutService = inject(LayoutService);
  private readonly store = inject(Store);
  private readonly configService = inject(ConfigService);

  user$ = this.store.select(LoginSelectors.selectUser);

  navItems$ = this.user$.pipe(
    map((user) => {
      const role = user?.role?.trim()?.toLowerCase();
      if (role === 'vendor') {
        return [
          { label: 'Dashboard', icon: 'dashboard', route: '/vendor/dashboard' },
          { label: 'Communication', icon: 'chat', route: '/communication' },
          {
            label: 'Finance & Procurement',
            icon: 'attach_money',
            children: [
              {
                label: 'Procurement Request',
                icon: 'shopping_cart',
                route: '/vendor/dashboard/finance/procurement-request',
              },
              {
                label: 'Payment Invoices',
                icon: 'receipt',
                route: '/vendor/dashboard/finance/invoices',
              },
            ],
          },
        ];
      } else if (role === 'worker') {
        return [
          { label: 'My Tasks', icon: 'task_alt', route: '/worker/tasks' },
          {
            label: 'Attendance',
            icon: 'schedule',
            route: '/worker/attendance',
          },
          { label: 'Communication', icon: 'chat', route: '/communication' },
        ];
      } else if (role === 'supervisor') {
        return [
          {
            label: 'Dashboard',
            icon: 'dashboard',
            route: '/supervisor/dashboard',
          },
          {
            label: 'Project Management',
            icon: 'folder_open',
            children: [
              {
                label: 'Projects',
                icon: 'work',
                route: '/supervisor/projects',
              },
            ],
          },
          {
            label: 'Workforce & Labor',
            icon: 'engineering',
            children: [
              {
                label: 'Verify Attendance',
                icon: 'fact_check',
                route: '/supervisor/verify-attendance',
              },
            ],
          },
          { label: 'Communication', icon: 'chat', route: '/communication' },
          {
            label: 'Progress & Reports',
            icon: 'trending_up',
            children: [
              {
                label: 'Daily Reports',
                icon: 'assignment',
                route: '/supervisor/reports',
              },
            ],
          },
          {
            label: 'Finance & Procurement',
            icon: 'payments',
            children: [
              {
                label: 'Purchase Order',
                icon: 'description',
                route: '/supervisor/finance/purchase-orders',
              },
              {
                label: 'Payment Approvals',
                icon: 'approval',
                route: '/supervisor/finance/approvals',
              },
            ],
          },
        ];
      }

      // Default/Admin Menu
      return [
        { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
        {
          label: 'Project Management',
          icon: 'folder_open',
          children: [
            { label: 'Projects', icon: 'work', route: '/admin/projects' },
            {
              label: 'Project Workers',
              icon: 'group',
              route: '/admin/project-workers',
            },
          ],
        },
        {
          label: 'Workforce & Labor',
          icon: 'engineering',
          children: [
            {
              label: 'Labor Roster',
              icon: 'group',
              route: '/admin/labor-roster',
            },
            {
              label: 'Attendance Tracking',
              icon: 'schedule',
              route: '/attendance',
            },
            {
              label: 'Work Scheduling',
              icon: 'calendar_month',
              route: '/scheduling',
            },
            {
              label: 'Productivity',
              icon: 'trending_up',
              route: '/productivity',
            },
          ],
        },
        { label: 'Communication', icon: 'chat', route: '/communication' },
        {
          label: 'Finance & Procurement',
          icon: 'attach_money',
          children: [
            {
              label: 'Vendor Management',
              icon: 'storefront',
              route: '/vendor-management',
            },
            { label: 'Payment Invoices', icon: 'receipt', route: '/admin/finance/invoices' },
            {
              label: 'Vendor Payments',
              icon: 'payments',
              route: '/vendor-payments',
            },
            {
              label: 'Material Approvals',
              icon: 'fact_check',
              route: '/admin/material-approvals',
            },
          ],
        },
      ];
    }),
  );

  expandedMenu: string | null = null;

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  toggleSubmenu(label: string): void {
    if (this.layoutService.isSidebarCollapsed()) return;

    if (this.expandedMenu === label) {
      this.expandedMenu = null;
    } else {
      this.expandedMenu = label;
    }
  }

  isMenuExpanded(label: string): boolean {
    return (
      this.expandedMenu === label && !this.layoutService.isSidebarCollapsed()
    );
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName?.charAt(0) || ''}${
      lastName?.charAt(0) || ''
    }`.toUpperCase();
  }

  getProfilePhotoUrl(url: string): string {
    if (url.startsWith('/')) {
      // Relative URL - prepend API base (remove /api/v1)
      const baseUrl = this.configService.apiBaseUrl;
      return `${baseUrl}${url}`;
    }
    return url;
  }
}
