import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  isSidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update((v) => !v);
  }

  setSidebarState(collapsed: boolean): void {
    this.isSidebarCollapsed.set(collapsed);
  }
}
