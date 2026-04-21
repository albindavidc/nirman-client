import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { map, BehaviorSubject, combineLatest } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Store } from '@ngrx/store';
import {
  trigger,
  transition,
  style,
  animate,
  stagger,
  query,
} from '@angular/animations';

import { Project, ProjectFilters } from '../../models/project.models';
import { ProjectModalComponent } from '../project-modal/project-modal.component';
import * as ProjectActions from '../../store/project.actions';
import * as ProjectSelectors from '../../store/project.selectors';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProjectService } from '../../services/project.service';
import * as AuthSelectors from '../../../../auth/login/store/login.selectors';
import { UserProfile, Role } from '../../../../../shared/models/profile.model';
import { Professional } from '../../models/project.models';

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
    MatSelectModule,
    MatFormFieldModule,
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
  private readonly store = inject(Store<any>);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);

  private readonly selectedSupervisorIdSubject = new BehaviorSubject<string | null>(null);

  // Store selectors
  projects$ = combineLatest([
    this.store.select(ProjectSelectors.selectProjects),
    this.selectedSupervisorIdSubject.asObservable(),
  ]).pipe(
    map(([projects, supervisorId]) => {
      if (!supervisorId) return projects;
      return projects.filter((p) => p.managerIds?.includes(supervisorId));
    })
  );

  stats$ = this.store.select(ProjectSelectors.selectStats);
  isLoading$ = this.store.select(ProjectSelectors.selectIsLoading);
  currentUser$ = this.store.select(AuthSelectors.selectUser);

  // Filter state
  supervisors: Professional[] = [];
  get selectedSupervisorId(): string | null {
    return this.selectedSupervisorIdSubject.value;
  }
  set selectedSupervisorId(value: string | null) {
    this.selectedSupervisorIdSubject.next(value);
  }
  
  canCreateProject = false;
  isAdmin = false;
  currentUser: UserProfile | null = null;

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
    this.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
        this.isAdmin = user.role === Role.ADMIN;
        this.canCreateProject = this.isAdmin;
        
        // If supervisor, set default filter to self
        if (user.role === Role.SUPERVISOR) {
          this.selectedSupervisorId = user.id;
        }
        
        this.loadProjects();
        this.store.dispatch(ProjectActions.loadProjectStats());
        this.fetchSupervisors();
      }
    });
  }

  loadProjects(): void {
    const filters: ProjectFilters = {
      page: 1,
      limit: 10,
    };
    
    if (this.selectedSupervisorId) {
      filters.supervisorId = this.selectedSupervisorId;
    }
    
    this.store.dispatch(ProjectActions.loadProjects({ filters }));
  }

  fetchSupervisors(): void {
    this.projectService
      .getProfessionals(undefined, undefined, 'supervisor')
      .pipe(
        map((professionals) =>
          professionals.sort((a, b) => a.fullName.localeCompare(b.fullName))
        )
      )
      .subscribe((sortedSupervisors) => {
        this.supervisors = sortedSupervisors;
      });
  }

  onSupervisorFilterChange(supervisorId: string | null): void {
    this.selectedSupervisorId = supervisorId;
    this.loadProjects();
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
    this.dialog.open(ProjectModalComponent, {
      width: '700px',
      maxHeight: '90vh',
      panelClass: 'dark-dialog',
    });
  }

  openEditProjectModal(project: Project, event: Event): void {
    event.stopPropagation();
    this.dialog.open(ProjectModalComponent, {
      width: '700px',
      maxHeight: '90vh',
      panelClass: 'dark-dialog',
      data: project,
    });
  }

  openProjectDetails(project: Project): void {
    this.router.navigate([project.id], { relativeTo: this.route });
  }

  openPhases(project: Project, event: Event): void {
    event.stopPropagation();
    this.router.navigate([project.id, 'phases'], { relativeTo: this.route });
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
