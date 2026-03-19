import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { map } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import {
  trigger,
  transition,
  style,
  animate,
  stagger,
  query,
} from '@angular/animations';

import { Project } from '../../models/project.models';
import { ProjectCreateModalComponent } from '../project-create-modal/project-create-modal.component';
import * as ProjectActions from '../../store/project.actions';
import * as ProjectSelectors from '../../store/project.selectors';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
    DatePipe,
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        query(
          '.stat-card, .project-card',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' }),
              ),
            ]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
})
export class ProjectListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Store selectors
  projects$ = this.store.select(ProjectSelectors.selectProjects);
  stats$ = this.store.select(ProjectSelectors.selectStats);
  isLoading$ = this.store.select(ProjectSelectors.selectIsLoading);

  // Dashboard Stats Observable
  dashboardStats$ = this.stats$.pipe(
    map((stats) => [
      {
        label: 'Active Projects',
        sublabel: 'Total Active',
        icon: 'folder_open',
        color: 'primary',
        value: stats.active || 0,
        change: 0,
      },
      {
        label: 'Completed Projects',
        sublabel: 'Total Completed',
        icon: 'check_circle',
        color: 'success',
        value: stats.completed || 0,
        change: 0,
      },
      {
        label: 'Total Workforce',
        sublabel: `Currently active`,
        icon: 'groups',
        color: 'info',
        value: 0,
        change: 0,
      },
      {
        label: 'Total Budget',
        sublabel: `Spent: $${((stats.budgetSpent || 0) / 1000000).toFixed(
          1,
        )}M (${
          stats.totalBudget
            ? Math.round(((stats.budgetSpent || 0) / stats.totalBudget) * 100)
            : 0
        }%)`,
        icon: 'payments',
        color: 'warning',
        value: `$${((stats.totalBudget || 0) / 1000000).toFixed(1)}M`,
        change: 0,
      },
    ]),
  );

  ngOnInit(): void {
    // Load projects from API
    this.store.dispatch(ProjectActions.loadProjects({}));
    this.store.dispatch(ProjectActions.loadProjectStats());
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return 'success';
    if (progress >= 50) return 'primary';
    if (progress >= 25) return 'warning';
    return 'danger';
  }

  openCreateProjectModal(): void {
    this.dialog.open(ProjectCreateModalComponent, {
      width: '700px',
      maxHeight: '90vh',
      panelClass: 'dark-dialog',
    });
  }

  openEditProjectModal(project: Project, event: Event): void {
    event.stopPropagation();
    this.dialog.open(ProjectCreateModalComponent, {
      width: '700px',
      maxHeight: '90vh',
      panelClass: 'dark-dialog',
      data: project,
    });
  }

  openProjectDetails(project: Project): void {
    this.router.navigate([project.id], { relativeTo: this.route });
  }

  onDeleteProject(project: Project, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Project',
        message: `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
        confirmButtonText: 'Delete',
        confirmButtonColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(ProjectActions.deleteProject({ id: project.id }));
      }
    });
  }
}
