import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../../core/services/layout.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SocketService } from '../../../core/services/socket.service';
import { SignalingPayload } from '../../../features/shared-features/communication/models/communication.models';
import { Chat } from '../../../features/shared-features/communication/communication-layout.component';
import { CallComponent } from '../../../features/shared-features/communication/components/call/call.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CommunicationService } from '../../../features/shared-features/communication/services/communication.service';
import { Subscription } from 'rxjs';

import { CallStateService } from '../../../core/services/call-state.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, SidebarComponent, CallComponent, MatIconModule, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  layoutService = inject(LayoutService);
  private socketService = inject(SocketService);
  public callState = inject(CallStateService);
  private subs = new Subscription();

  ngOnInit() {
    this.socketService.initSockets();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
