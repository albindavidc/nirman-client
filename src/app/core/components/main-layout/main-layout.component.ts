import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main
        class="main-content"
        [class.expanded]="layoutService.isSidebarCollapsed()"
      >
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .app-layout {
        display: flex;
        min-height: 100vh;
        background: var(--md-sys-color-background);
      }

      .main-content {
        flex: 1;
        padding-left: 260px; // Matches expanded sidebar width
        transition: padding-left 0.3s ease;
        width: 100%;
        min-width: 0; // Fixes flex child overflow issues

        &.expanded {
          padding-left: 80px; // Matches collapsed sidebar width
        }
      }
    `,
  ],
})
export class MainLayoutComponent {
  layoutService = inject(LayoutService);
}
