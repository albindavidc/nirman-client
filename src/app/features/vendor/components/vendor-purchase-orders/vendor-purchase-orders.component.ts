import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, ActivatedRoute } from '@angular/router';
import { MaterialService } from '../../../shared-features/projects/services/material.service';
import { ProjectService } from '../../../shared-features/projects/services/project.service';
import { Project } from '../../../shared-features/projects/models/project.models';
import { PurchaseOrderResponseDto } from '../../../../shared/models/purchase-order.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { forkJoin, of, catchError } from 'rxjs';

@Component({
  selector: 'app-vendor-purchase-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './vendor-purchase-orders.component.html',
  styleUrls: ['./vendor-purchase-orders.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
})
export class VendorPurchaseOrdersComponent implements OnInit {
  private readonly materialService = inject(MaterialService);
  private readonly projectService = inject(ProjectService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  purchaseOrders: PurchaseOrderResponseDto[] = [];
  filteredPurchaseOrders: PurchaseOrderResponseDto[] = [];
  isLoading = false;
  currentFilter = 'ALL';
  searchText = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['filter']) {
        this.currentFilter = params['filter'].toUpperCase();
      }
      this.loadAllPurchaseOrders();
    });
  }

  loadAllPurchaseOrders(): void {
    this.isLoading = true;
    // Step 1: Get all projects
    this.projectService.getProjects().subscribe({
      next: (response) => {
        const projects = response.data;
        if (projects.length === 0) {
          this.isLoading = false;
          return;
        }

        // Step 2: For each project, get POs
        const poRequests = projects.map((p: Project) =>
          this.materialService.getProjectPurchaseOrders(p.id).pipe(
            catchError(() => of([])), // Handle individual project errors gracefully
          ),
        );

        forkJoin(poRequests).subscribe({
          next: (allPoResults: PurchaseOrderResponseDto[][]) => {
            // Step 3: Flatten results and store
            this.purchaseOrders = allPoResults.flat();
            this.applyCurrentFilters();
            this.isLoading = false;
          },
          error: () => {
            this.notificationService.error('Failed to load purchase orders');
            this.isLoading = false;
          },
        });
      },
      error: () => {
        this.notificationService.error('Failed to load projects');
        this.isLoading = false;
      },
    });
  }

  applyCurrentFilters(): void {
    this.filteredPurchaseOrders = this.purchaseOrders.filter((po) => {
      const matchesStatus =
        this.currentFilter === 'ALL' ||
        po.paymentStatus.toLowerCase() === this.currentFilter.toLowerCase();
      const matchesSearch =
        !this.searchText ||
        po.poNumber.toLowerCase().includes(this.searchText.toLowerCase()) ||
        po.projectId.toLowerCase().includes(this.searchText.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  applyFilter(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value;
    this.applyCurrentFilters();
  }

  filterByStatus(status: string): void {
    this.currentFilter = status || 'ALL';
    this.applyCurrentFilters();
  }

  viewDetails(po: PurchaseOrderResponseDto): void {
    // Currently no detail page, could open a dialog or navigate
    this.notificationService.info(`Viewing details for ${po.poNumber}`);
  }

  createInvoice(po: PurchaseOrderResponseDto): void {
    this.router.navigate(['/vendor/purchase-orders', po.id, 'create-invoice'], {
      queryParams: { projectId: po.projectId },
    });
  }
}
