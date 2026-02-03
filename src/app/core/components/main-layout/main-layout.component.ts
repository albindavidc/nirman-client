import { Component, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  layoutService = inject(LayoutService);
}
