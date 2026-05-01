import { Component, inject, OnInit, OnDestroy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { LayoutService } from '../../../core/services/layout.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SocketService } from '../../../core/services/socket.service';
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
  private socketService = inject(SocketService);
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  ngOnInit() {
    this.socketService.initSockets();
  }

  ngOnDestroy() {
    // We don't disconnect sockets here because MainLayout persists across features.
    // Sockets are handled reactively by SocketService based on auth state.
  }

}
