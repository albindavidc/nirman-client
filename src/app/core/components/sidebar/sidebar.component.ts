import { Component, inject } from '@angular/core';
import { CommonModule, TitleCasePipe, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { Store } from '@ngrx/store';
import { LayoutService } from '../../services/layout.service';
import * as LoginSelectors from '../../../features/auth/login/store/login.selectors';
import { map } from 'rxjs/operators';

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
    TitleCasePipe,
    AsyncPipe,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  layoutService = inject(LayoutService);
  private readonly store = inject(Store);

  user$ = this.store.select(LoginSelectors.selectUser);

  navItems$ = this.user$.pipe(
    map((user) => {
      const role = user?.role?.toLowerCase();
      if (role === 'vendor') {
        return [
          { label: 'Dashboard', icon: 'dashboard', route: '/dashboard/vendor' },
          {
            label: 'Communication',
            icon: 'chat',
            children: [
              {
                label: 'Messaging',
                icon: 'mail',
                route: '/dashboard/vendor/communication/messaging',
              },
              {
                label: 'Notifications',
                icon: 'notifications',
                route: '/dashboard/vendor/communication/notifications',
              },
            ],
          },
          {
            label: 'Finance & Procurement',
            icon: 'attach_money',
            children: [
              {
                label: 'Procurement Request',
                icon: 'shopping_cart',
                route: '/dashboard/vendor/finance/procurement-request',
              },
              {
                label: 'Payment Invoices',
                icon: 'receipt',
                route: '/dashboard/vendor/finance/invoices',
              },
            ],
          },
        ];
      } else if (role === 'worker') {
        return [
          { label: 'Dashboard', icon: 'dashboard', route: '/dashboard/worker' },
          {
            label: 'Workforce & Labor',
            icon: 'engineering',
            children: [
              {
                label: 'Attendance',
                icon: 'schedule',
                route: '/dashboard/worker/attendance',
              },
              {
                label: 'Scheduling',
                icon: 'calendar_month',
                route: '/dashboard/worker/scheduling',
              },
            ],
          },
          {
            label: 'Communication',
            icon: 'chat',
            children: [
              {
                label: 'Messaging',
                icon: 'mail',
                route: '/dashboard/worker/communication/messaging',
              },
              {
                label: 'Notifications',
                icon: 'notifications',
                route: '/dashboard/worker/communication/notifications',
              },
            ],
          },
        ];
      } else if (role === 'supervisor') {
        return [
          {
            label: 'Dashboard',
            icon: 'dashboard',
            route: '/dashboard/supervisor',
          },
          {
            label: 'Project Management',
            icon: 'folder_open',
            children: [
              {
                label: 'Projects',
                icon: 'work',
                route: '/dashboard/supervisor/projects',
              },
              {
                label: 'Phases',
                icon: 'timelapse',
                route: '/dashboard/supervisor/phases',
              },
              {
                label: 'Tasks',
                icon: 'task_alt',
                route: '/dashboard/supervisor/tasks',
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
                route: '/dashboard/supervisor/verify-attendance',
              },
            ],
          },
          {
            label: 'Communication',
            icon: 'chat',
            children: [
              {
                label: 'Chat Messaging',
                icon: 'forum',
                route: '/dashboard/supervisor/communication/messaging',
              },
              {
                label: 'Notifications',
                icon: 'notifications_active',
                route: '/dashboard/supervisor/communication/notifications',
              },
            ],
          },
          {
            label: 'Progress & Reports',
            icon: 'trending_up',
            children: [
              {
                label: 'Daily Reports',
                icon: 'assignment',
                route: '/dashboard/supervisor/reports',
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
                route: '/dashboard/supervisor/finance/purchase-orders',
              },
              {
                label: 'Payment Approvals',
                icon: 'approval',
                route: '/dashboard/supervisor/finance/approvals',
              },
            ],
          },
        ];
      }

      // Default/Admin Menu
      return [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        {
          label: 'Project Management',
          icon: 'folder_open',
          children: [
            { label: 'Projects', icon: 'work', route: '/projects' },
            {
              label: 'Project Members',
              icon: 'group',
              route: '/project-members',
            },
            { label: 'Phases', icon: 'timelapse', route: '/phases' },
            {
              label: 'Phase Approvals',
              icon: 'verified',
              route: '/phase-approvals',
            },
            { label: 'Tasks', icon: 'task', route: '/tasks' },
          ],
        },
        {
          label: 'Workforce & Labor',
          icon: 'engineering',
          children: [
            { label: 'Labor Roster', icon: 'group', route: '/workers' },
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
        {
          label: 'Communication',
          icon: 'chat',
          children: [
            {
              label: 'Messaging',
              icon: 'mail',
              route: '/communication/messaging',
            },
            {
              label: 'Notifications',
              icon: 'notifications',
              route: '/communication/notifications',
            },
          ],
        },
        {
          label: 'Finance & Procurement',
          icon: 'attach_money',
          children: [
            {
              label: 'Vendor Management',
              icon: 'storefront',
              route: '/vendor-management',
            },
            { label: 'Payment Invoices', icon: 'receipt', route: '/invoices' },
            {
              label: 'Vendor Payments',
              icon: 'payments',
              route: '/vendor-payments',
            },
          ],
        },
      ];
    })
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
      const baseUrl = 'http://localhost:3000';
      return `${baseUrl}${url}`;
    }
    return url;
  }
}
