import { Component, inject, OnInit, OnDestroy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { LayoutService } from '../../../core/services/layout.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../core/services/config.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  layoutService = inject(LayoutService);
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.sendHeartbeat();
    this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), 60 * 1000);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  ngOnDestroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private sendHeartbeat() {
    this.http.post(`${this.configService.apiUrl}/auth/heartbeat`, {}).subscribe({
      error: (err) => console.error('Heartbeat failed', err)
    });
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      navigator.sendBeacon(`${this.configService.apiUrl}/auth/offline`);
    }
  };
}
