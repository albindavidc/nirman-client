import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { MatIconModule } from '@angular/material/icon';
import { GoogleMapsModule } from '@angular/google-maps';
import * as ProjectSelectors from '../../store/project.selectors';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { ConfigService } from '../../../../../core/services/config.service';
import { combineLatest, filter, map, switchMap, of, catchError } from 'rxjs';
import { Project, ProjectPhase } from '../../models/project.models';

@Component({
  selector: 'app-project-overview',
  standalone: true,
  imports: [CommonModule, MatIconModule, GoogleMapsModule],
  templateUrl: './project-overview.component.html',
  styleUrl: './project-overview.component.scss',
})
export class ProjectOverviewComponent {
  private readonly store = inject(Store);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly taskService = inject(TaskService);
  private readonly projectService = inject(ProjectService);
  private readonly configService = inject(ConfigService);

  project$ = this.store.select(ProjectSelectors.selectSelectedProject);

  stats$ = this.project$.pipe(
    filter((p): p is Project => !!p),
    switchMap((project) =>
      combineLatest({
        tasks: this.taskService.getProjectTasks(project.id).pipe(
          catchError(() => of([])), // Handle error gracefully
        ),
        // We'll mock attendance for now or fetch if endpoint ready.
        // Assuming fetch is heavy, we'll just use 0 for now as 'active today' logic needs date filtering on backend ideally.
        // But let's try to fetch simple attendance if permitted.
        // Actually, let's keep it simple and just do tasks for now to fix the big 89/156 lie.
        // For active members, we can verify if they have 'joinedAt' recently or just show total.
        // Reverting to calculating active members from tasks assigned? No.
        // Let's rely on empty for now if no attendance endpoint optimized.
        attendance: of([]),
      }).pipe(
        map(({ tasks }) => {
          const completedTasks = tasks.filter(
            (t) => t.status === 'Completed' || t.status === 'Done',
          ).length;
          const totalTasks = tasks.length;
          const tasksProgress = totalTasks
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;

          return {
            completedTasks,
            totalTasks,
            tasksProgress,
            activeWorkersToday: 0, // Placeholder until attendance date filter is ready
          };
        }),
      ),
    ),
  );

  activePhasesCount(phases: ProjectPhase[] | undefined): number {
    if (!phases) return 0;
    return phases.filter(
      (p) => p.status === 'In Progress' || p.status === 'active',
    ).length;
  }

  getCompletedPhases(phases: ProjectPhase[] | undefined): number {
    if (!phases) return 0;
    return phases.filter(
      (p) => p.status === 'completed' || p.status === 'Completed',
    ).length;
  }

  getPendingPhases(phases: ProjectPhase[] | undefined): number {
    if (!phases) return 0;
    return phases.filter(
      (p) => p.status === 'pending' || p.status === 'Pending',
    ).length;
  }

  // Method removed in favor of observable logic

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
  }

  getSpentPercentage(project: Project): number {
    if (!project.budget || !project.spent) return 0;
    return Math.round((project.spent / project.budget) * 100);
  }

  formatBudget(amount: number | undefined): string {
    if (!amount) return '0';
    if (amount >= 100000) {
      return (amount / 100000).toFixed(1) + ' Lakh';
    }
    return amount.toLocaleString();
  }

  getMapUrl(lat: number, lng: number): SafeResourceUrl {
    const url = `https://www.google.com/maps/embed/v1/place?key=${this.configService.googleMapsApiKey}&q=${lat},${lng}&zoom=15`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getGoogleMapsLink(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  // Dark theme map options
  darkMapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true, // Enable mouse scroll zoom
    gestureHandling: 'greedy', // Allow zoom without ctrl key
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: 0, // HORIZONTAL_BAR
      position: 5, // LEFT_TOP - moves buttons to left side
    },
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }],
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }],
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }],
      },
    ],
  };
}
