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
import { Material } from '../../../shared-features/projects/models/material.model';
import { PurchaseOrderResponseDto } from '../../../../shared/models/purchase-order.model';
import { NotificationService } from '../../../../core/services/notification.service';

/** Alias kept for clarity within this component */
type ProjectMaterial = Material;
import { trigger, transition, style, animate } from '@angular/animations';
import { forkJoin, of, catchError } from 'rxjs';

export interface EnrichedPurchaseOrder extends PurchaseOrderResponseDto {
  projectName?: string;
  supervisorName?: string;
  locationName?: string;
  locationLink?: string;
}

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

  purchaseOrders: EnrichedPurchaseOrder[] = [];
  filteredPurchaseOrders: EnrichedPurchaseOrder[] = [];
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

        // Step 2: For each project, get POs AND Materials
        const projectDataRequests = projects.map((p: Project) =>
          forkJoin({
            pos: this.materialService.getProjectPurchaseOrders(p.id).pipe(catchError(() => of([]))),
            materials: this.materialService.getProjectMaterials(p.id).pipe(catchError(() => of([])))
          })
        );

        forkJoin(projectDataRequests).subscribe({
          next: (results: { pos: PurchaseOrderResponseDto[]; materials: ProjectMaterial[] }[]) => {
            const enrichedPos: EnrichedPurchaseOrder[] = [];

            results.forEach((res, index) => {
              const project = projects[index];
              const projectMaterials = res.materials;

              res.pos.forEach((po: PurchaseOrderResponseDto) => {
                const enriched: EnrichedPurchaseOrder = { ...po };
                enriched.projectName = project.name;

                // Enrich items with material names and units from project materials
                enriched.items = po.items.map(item => {
                  const material = projectMaterials.find((m: ProjectMaterial) => m.id === item.materialId);
                  return {
                    ...item,
                    materialName: material?.name || item.materialName || 'Material',
                    unit: material?.unit || 'units'
                  };
                });

                // Find Supervisor name
                const supervisorWorker = project.workers?.find(
                  (w) => w.role.toLowerCase() === 'supervisor',
                );
                if (supervisorWorker) {
                  const member = project.teamMembers?.find(
                    (m) => m.id === supervisorWorker.userId,
                  );
                  enriched.supervisorName = member?.name || 'Assigned Supervisor';
                } else if (project.managerIds && project.managerIds.length > 0) {
                  enriched.supervisorName = 'Project Manager';
                }

                // Location Details
                if (project.latitude && project.longitude) {
                  enriched.locationName = project.description?.substring(0, 30) || 'Project Site';
                  enriched.locationLink = `https://www.google.com/maps/search/?api=1&query=${project.latitude},${project.longitude}`;
                }

                enrichedPos.push(enriched);
              });
            });

            this.purchaseOrders = enrichedPos;
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

  viewDetails(po: EnrichedPurchaseOrder): void {
    // Currently no detail page, could open a dialog or navigate
    this.notificationService.info(`Viewing details for ${po.poNumber}`);
  }

  createInvoice(po: EnrichedPurchaseOrder): void {
    this.router.navigate(['/vendor/purchase-orders', po.id, 'create-invoice'], {
      queryParams: { projectId: po.projectId },
    });
  }
}
